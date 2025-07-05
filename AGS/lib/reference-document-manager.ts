import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import fs from 'fs/promises';
import path from 'path';

export class ReferenceDocumentManager {
  private vectorStore: FaissStore | null = null;
  private embeddings: GoogleGenerativeAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;
  private readonly documentsPath = path.join(process.cwd(), 'reference_documents');
  private readonly vectorStorePath = path.join(process.cwd(), 'vector_store');

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      modelName: 'text-embedding-004',
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });
  }

  /**
   * Initialize or load existing vector store
   */
  async initializeVectorStore(): Promise<void> {
    try {
      // Try to load existing vector store
      if (await this.vectorStoreExists()) {
        console.log('Loading existing vector store...');
        this.vectorStore = await FaissStore.load(this.vectorStorePath, this.embeddings);
        console.log('Vector store loaded successfully');
      } else {
        console.log('Creating new vector store...');
        await this.createVectorStore();
      }
    } catch (error) {
      console.error('Error initializing vector store:', error);
      // Fallback: create new vector store
      await this.createVectorStore();
    }
  }

  /**
   * Check if vector store exists
   */
  private async vectorStoreExists(): Promise<boolean> {
    try {
      await fs.access(path.join(this.vectorStorePath, 'faiss.index'));
      await fs.access(path.join(this.vectorStorePath, 'docstore.json'));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create vector store from reference documents
   */
  private async createVectorStore(): Promise<void> {
    try {
      const documents = await this.loadAllDocuments();
      
      if (documents.length === 0) {
        console.log('No documents found, creating empty vector store');
        // Create with a dummy document
        const dummyDoc = new Document({
          pageContent: 'Oil palm agriculture knowledge base initialization document.',
          metadata: { source: 'system', type: 'initialization' }
        });
        this.vectorStore = await FaissStore.fromDocuments([dummyDoc], this.embeddings);
      } else {
        console.log(`Creating vector store from ${documents.length} document chunks...`);
        this.vectorStore = await FaissStore.fromDocuments(documents, this.embeddings);
      }

      // Save vector store
      await this.vectorStore.save(this.vectorStorePath);
      console.log('Vector store created and saved successfully');
    } catch (error) {
      console.error('Error creating vector store:', error);
      throw error;
    }
  }

  /**
   * Load all documents from reference_documents directory
   */
  private async loadAllDocuments(): Promise<Document[]> {
    const allDocuments: Document[] = [];

    try {
      const files = await this.getDocumentFiles(this.documentsPath);
      
      for (const filePath of files) {
        try {
          const documents = await this.loadDocument(filePath);
          const chunks = await this.textSplitter.splitDocuments(documents);
          allDocuments.push(...chunks);
          console.log(`Loaded ${chunks.length} chunks from ${path.basename(filePath)}`);
        } catch (error) {
          console.error(`Error loading document ${filePath}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }

    return allDocuments;
  }

  /**
   * Get all document files recursively
   */
  private async getDocumentFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getDocumentFiles(fullPath);
          files.push(...subFiles);
        } else if (this.isSupportedFile(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
    
    return files;
  }

  /**
   * Check if file is supported
   */
  private isSupportedFile(filename: string): boolean {
    const supportedExtensions = ['.txt', '.md', '.pdf'];
    const ext = path.extname(filename).toLowerCase();
    return supportedExtensions.includes(ext);
  }

  /**
   * Load a single document
   */
  private async loadDocument(filePath: string): Promise<Document[]> {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.txt':
      case '.md':
        const textLoader = new TextLoader(filePath);
        return await textLoader.load();
      
      case '.pdf':
        const pdfLoader = new PDFLoader(filePath);
        return await pdfLoader.load();
      
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  /**
   * Add new document to vector store
   */
  async addDocument(filePath: string): Promise<void> {
    try {
      if (!this.vectorStore) {
        await this.initializeVectorStore();
      }

      const documents = await this.loadDocument(filePath);
      const chunks = await this.textSplitter.splitDocuments(documents);
      
      if (this.vectorStore) {
        await this.vectorStore.addDocuments(chunks);
        await this.vectorStore.save(this.vectorStorePath);
        console.log(`Added ${chunks.length} chunks from ${path.basename(filePath)}`);
      }
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  /**
   * Search for relevant documents
   */
  async searchRelevantDocuments(query: string, topK: number = 5): Promise<Document[]> {
    try {
      if (!this.vectorStore) {
        await this.initializeVectorStore();
      }

      if (!this.vectorStore) {
        console.warn('Vector store not available');
        return [];
      }

      const results = await this.vectorStore.similaritySearch(query, topK);
      return results;
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  /**
   * Get contextual information for LLM
   */
  async getContextForQuery(query: string): Promise<string> {
    try {
      const relevantDocs = await this.searchRelevantDocuments(query, 3);
      
      if (relevantDocs.length === 0) {
        return '';
      }

      const context = relevantDocs
        .map((doc, index) => {
          const source = doc.metadata.source ? path.basename(doc.metadata.source) : 'Unknown';
          return `[Reference ${index + 1} from ${source}]:\n${doc.pageContent}`;
        })
        .join('\n\n');

      return context;
    } catch (error) {
      console.error('Error getting context:', error);
      return '';
    }
  }

  /**
   * Rebuild vector store from scratch
   */
  async rebuildVectorStore(): Promise<void> {
    try {
      // Delete existing vector store
      try {
        await fs.rm(this.vectorStorePath, { recursive: true, force: true });
      } catch {
        console.log('No existing vector store to delete');
      }

      // Create new vector store
      await this.createVectorStore();
      console.log('Vector store rebuilt successfully');
    } catch (error) {
      console.error('Error rebuilding vector store:', error);
      throw error;
    }
  }

  /**
   * Get statistics about the vector store
   */
  async getStats(): Promise<{ documentCount: number; hasVectorStore: boolean }> {
    try {
      const hasVectorStore = this.vectorStore !== null;
      let documentCount = 0;

      if (hasVectorStore && this.vectorStore) {
        // Get document count (approximation)
        const testResults = await this.vectorStore.similaritySearch('test', 1000);
        documentCount = testResults.length;
      }

      return { documentCount, hasVectorStore };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { documentCount: 0, hasVectorStore: false };
    }
  }
}

// Singleton instance
let documentManager: ReferenceDocumentManager | null = null;

export function getReferenceDocumentManager(): ReferenceDocumentManager {
  if (!documentManager) {
    documentManager = new ReferenceDocumentManager();
  }
  return documentManager;
}
