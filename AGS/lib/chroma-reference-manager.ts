import { OpenAIEmbeddings } from '@langchain/openai';
import { CloudClient } from "chromadb";
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

export interface ChromaMetadata {
  source: string;
  type: string;
  chunk_index: number;
  total_chunks: number;
  file_hash: string;
  created_at: string;
  filename?: string | null;
  similarity_score?: number | null;
  search_query?: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

export interface ChromaDocument {
  id: string;
  content: string;
  metadata: ChromaMetadata;
  embedding?: number[];
}

export class ChromaReferenceManager {
  private chromaClient: CloudClient;
  private embeddings: OpenAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;
  private readonly documentsPath = path.join(process.cwd(), 'reference_documents');
  private readonly collectionName = 'oil_palm_references';
  
  constructor() {
    try {
      // Initialize Chroma Cloud client
      this.chromaClient = new CloudClient({
        apiKey: process.env.CHROMA_API_KEY || 'ck-4jKetkJctgX9gLuEtqY2E6DHDvAiAMN7YbiuM7i82DFc',
        tenant: process.env.CHROMA_TENANT || '0c1519c2-038f-418e-a2a0-c3765e34c7df',
        database: process.env.CHROMA_DATABASE || 'AGS'
      });

      // Initialize OpenAI embeddings
      const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY environment variable.');
      }
      
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: apiKey,
        modelName: 'text-embedding-3-small',
        dimensions: 1536,
      });
      
      console.log('ChromaReferenceManager initialized successfully');
    } catch (error) {
      console.error('Error initializing ChromaReferenceManager:', error);
      throw new Error(`Failed to initialize ChromaReferenceManager: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });
  }

  /**
   * Initialize or load existing collection
   */
  async initializeCollection(): Promise<void> {
    try {
      // Create or get collection
      const collection = await this.chromaClient.getOrCreateCollection({
        name: this.collectionName,
        metadata: {
          description: "Oil palm agronomic reference documents for Malaysian plantation management",
          created: new Date().toISOString(),
          domain: "oil_palm_agriculture",
          region: "Malaysia"
        }
      });

      console.log(`Collection '${this.collectionName}' initialized successfully`);
      
      // Check if collection is empty and needs to be populated
      const count = await collection.count();
      if (count === 0) {
        console.log('Collection is empty, loading reference documents...');
        await this.loadAllDocuments();
      } else {
        console.log(`Collection contains ${count} documents`);
      }
    } catch (error) {
      console.error('Error initializing collection:', error);
      throw error;
    }
  }

  /**
   * Load all documents from reference_documents directory into ChromaDB
   */
  private async loadAllDocuments(): Promise<void> {
    try {
      const files = await this.getDocumentFiles(this.documentsPath);
      let totalDocuments = 0;
      
      for (const filePath of files) {
        try {
          const documents = await this.loadDocument(filePath);
          
          // Filter out any documents with invalid content before splitting
          const validDocuments = documents.filter(doc => 
            doc.pageContent && 
            typeof doc.pageContent === 'string' && 
            doc.pageContent.trim().length > 0
          );
          
          if (validDocuments.length === 0) {
            console.log(`No valid content found in ${filePath}, skipping...`);
            continue;
          }
          
          // Split documents into chunks
          const chunks: Document[] = [];
          for (const doc of validDocuments) {
            const splitChunks = await this.textSplitter.splitDocuments([doc]);
            chunks.push(...splitChunks);
          }
          
          // Add to ChromaDB
          await this.addDocumentsToChroma(chunks, filePath);
          totalDocuments += chunks.length;
          
          console.log(`Added ${chunks.length} chunks from ${path.basename(filePath)}`);
        } catch (error) {
          console.error(`Error processing ${filePath}:`, error);
          // Continue with other documents
        }
      }
      
      console.log(`Successfully loaded ${totalDocuments} total document chunks into ChromaDB`);
    } catch (error) {
      console.error('Error loading documents:', error);
      throw error;
    }
  }

  /**
   * Add documents to ChromaDB collection
   */
  private async addDocumentsToChroma(documents: Document[], sourceFile: string): Promise<void> {
    try {
      const collection = await this.chromaClient.getCollection({
        name: this.collectionName
      });

      // Create file hash for deduplication
      const fileHash = createHash('md5').update(sourceFile).digest('hex');
      
      // Prepare documents for ChromaDB
      const chromaDocs: ChromaDocument[] = [];
      const embeddings: number[][] = [];
      
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const docId = `${fileHash}_chunk_${i}`;
        
        // Generate embedding
        const embedding = await this.embeddings.embedQuery(doc.pageContent);
        
        chromaDocs.push({
          id: docId,
          content: doc.pageContent,
          metadata: {
            source: sourceFile,
            type: this.getDocumentType(sourceFile),
            chunk_index: i,
            total_chunks: documents.length,
            file_hash: fileHash,
            created_at: new Date().toISOString(),
            ...doc.metadata
          },
          embedding
        });
        
        embeddings.push(embedding);
      }

      // Add to collection
      await collection.add({
        ids: chromaDocs.map(doc => doc.id),
        documents: chromaDocs.map(doc => doc.content),
        metadatas: chromaDocs.map(doc => {
          const cleanMetadata: Record<string, string | number | boolean | null> = {};
          Object.entries(doc.metadata).forEach(([key, value]) => {
            cleanMetadata[key] = value !== undefined ? value : null;
          });
          return cleanMetadata;
        }),
        embeddings: embeddings
      });

      console.log(`Added ${chromaDocs.length} documents to ChromaDB collection`);
    } catch (error) {
      console.error('Error adding documents to ChromaDB:', error);
      throw error;
    }
  }

  /**
   * Search for relevant documents using similarity search
   */
  async searchRelevantDocuments(query: string, limit: number = 10): Promise<ChromaDocument[]> {
    try {
      const collection = await this.chromaClient.getCollection({
        name: this.collectionName
      });

      // Generate query embedding
      const queryEmbedding = await this.embeddings.embedQuery(query);

      // Search in ChromaDB
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        include: ['documents', 'metadatas', 'distances']
      });

      // Format results
      const documents: ChromaDocument[] = [];
      
      if (results.documents && results.documents[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          const document = results.documents[0][i];
          const metadata = results.metadatas?.[0]?.[i] || {};
          const distance = results.distances?.[0]?.[i] || 1.0;
          
          documents.push({
            id: results.ids?.[0]?.[i] || `result_${i}`,
            content: document || '',
            metadata: {
              source: (metadata as Record<string, unknown>)?.source as string || 'unknown',
              type: (metadata as Record<string, unknown>)?.type as string || 'unknown',
              chunk_index: (metadata as Record<string, unknown>)?.chunk_index as number || 0,
              total_chunks: (metadata as Record<string, unknown>)?.total_chunks as number || 1,
              file_hash: (metadata as Record<string, unknown>)?.file_hash as string || '',
              created_at: (metadata as Record<string, unknown>)?.created_at as string || new Date().toISOString(),
              similarity_score: 1 - distance,
              search_query: query
            }
          });
        }
      }

      return documents;
    } catch (error) {
      console.error('Error searching documents:', error);
      
      // Return empty results if search fails
      return [];
    }
  }

  /**
   * Get documents by type (research_paper, best_practice, case_study, etc.)
   */
  async getDocumentsByType(type: string, limit: number = 20): Promise<ChromaDocument[]> {
    try {
      const collection = await this.chromaClient.getCollection({
        name: this.collectionName
      });

      // Query by metadata filter
      const results = await collection.get({
        where: { type: type },
        limit: limit,
        include: ['documents', 'metadatas']
      });

      // Format results
      const documents: ChromaDocument[] = [];
      
      if (results.documents) {
        for (let i = 0; i < results.documents.length; i++) {
          const document = results.documents[i];
          const metadata = results.metadatas?.[i] || {};
          
          documents.push({
            id: results.ids?.[i] || `doc_${i}`,
            content: document || '',
            metadata: {
              source: (metadata as Record<string, unknown>)?.source as string || 'unknown',
              type: (metadata as Record<string, unknown>)?.type as string || 'unknown',
              chunk_index: (metadata as Record<string, unknown>)?.chunk_index as number || 0,
              total_chunks: (metadata as Record<string, unknown>)?.total_chunks as number || 1,
              file_hash: (metadata as Record<string, unknown>)?.file_hash as string || '',
              created_at: (metadata as Record<string, unknown>)?.created_at as string || new Date().toISOString()
            }
          });
        }
      }

      return documents;
    } catch (error) {
      console.error('Error getting documents by type:', error);
      return [];
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(): Promise<{
    total_documents: number;
    document_types: Record<string, number>;
    sources: string[];
  }> {
    try {
      const collection = await this.chromaClient.getCollection({
        name: this.collectionName
      });

      const count = await collection.count();
      
      // Get all documents to analyze types and sources
      const results = await collection.get({
        include: ['metadatas']
      });

      const document_types: Record<string, number> = {};
      const sources = new Set<string>();

      if (results.metadatas) {
        for (const metadata of results.metadatas) {
          const metadataRecord = metadata as Record<string, unknown>;
          const type = metadataRecord?.type as string || 'unknown';
          const source = metadataRecord?.source as string || 'unknown';
          
          document_types[type] = (document_types[type] || 0) + 1;
          sources.add(source);
        }
      }

      return {
        total_documents: count,
        document_types,
        sources: Array.from(sources)
      };
    } catch (error) {
      console.error('Error getting collection stats:', error);
      return {
        total_documents: 0,
        document_types: {},
        sources: []
      };
    }
  }

  /**
   * Update or refresh documents from a specific source
   */
  async updateDocumentSource(sourceFile: string): Promise<void> {
    try {
      const collection = await this.chromaClient.getCollection({
        name: this.collectionName
      });

      const fileHash = createHash('md5').update(sourceFile).digest('hex');
      
      // Delete existing documents from this source
      const existingDocs = await collection.get({
        where: { file_hash: fileHash }
      });
      
      if (existingDocs.ids && existingDocs.ids.length > 0) {
        await collection.delete({
          ids: existingDocs.ids
        });
        console.log(`Deleted ${existingDocs.ids.length} existing documents from ${sourceFile}`);
      }

      // Re-add documents
      const documents = await this.loadDocument(sourceFile);
      const validDocuments = documents.filter(doc => 
        doc.pageContent && 
        typeof doc.pageContent === 'string' && 
        doc.pageContent.trim().length > 0
      );
      
      if (validDocuments.length > 0) {
        const chunks: Document[] = [];
        for (const doc of validDocuments) {
          const splitChunks = await this.textSplitter.splitDocuments([doc]);
          chunks.push(...splitChunks);
        }
        
        await this.addDocumentsToChroma(chunks, sourceFile);
        console.log(`Updated ${chunks.length} chunks from ${sourceFile}`);
      }
    } catch (error) {
      console.error('Error updating document source:', error);
      throw error;
    }
  }

  /**
   * Get document files from directory
   */
  private async getDocumentFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          // Recursively get files from subdirectories
          const subFiles = await this.getDocumentFiles(fullPath);
          files.push(...subFiles);
        } else if (item.isFile() && this.isSupportedFile(item.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
    }
    
    return files;
  }

  /**
   * Check if file is supported
   */
  private isSupportedFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ['.pdf', '.txt', '.md'].includes(ext);
  }

  /**
   * Load a single document
   */
  private async loadDocument(filePath: string): Promise<Document[]> {
    const ext = path.extname(filePath).toLowerCase();
    
    try {
      let loader;
      
      if (ext === '.pdf') {
        loader = new PDFLoader(filePath);
      } else if (ext === '.txt' || ext === '.md') {
        loader = new TextLoader(filePath);
      } else {
        console.warn(`Unsupported file type: ${ext}`);
        return [];
      }
      
      const documents = await loader.load();
      
      // Add source metadata
      return documents.map(doc => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          source: filePath,
          filename: path.basename(filePath),
          type: this.getDocumentType(filePath)
        }
      }));
    } catch (error) {
      console.error(`Error loading document ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Determine document type based on file path
   */
  private getDocumentType(filePath: string): string {
    const pathLower = filePath.toLowerCase();
    
    if (pathLower.includes('best_practices')) return 'best_practice';
    if (pathLower.includes('case_studies')) return 'case_study';
    if (pathLower.includes('disease_guides')) return 'disease_guide';
    if (pathLower.includes('research_papers')) return 'research_paper';
    if (pathLower.includes('.pdf')) return 'research_paper';
    if (pathLower.includes('.md')) return 'guide';
    
    return 'reference_document';
  }
}
