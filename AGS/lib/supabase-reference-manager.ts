import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { RagContext } from '../types';

export interface DocumentEmbedding {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  content_hash: string;
  embedding: number[];
  metadata: Record<string, string | number | boolean>;
  token_count?: number;
  created_at: string;
}

export interface ReferenceDocument {
  id: string;
  title: string;
  description?: string;
  source?: string;
  document_type?: string;
  file_path?: string;
  content_hash?: string;
  metadata: Record<string, string | number | boolean>;
  language: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  content: string;
  metadata: Record<string, string | number | boolean>;
  similarity: number;
  document_title?: string;
  document_source?: string;
  chunk_index: number;
}

export class SupabaseReferenceManager {
  private supabase: SupabaseClient<Database>;
  private embeddings: OpenAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;
  private readonly documentsPath = path.join(process.cwd(), 'reference_documents');
  private readonly storageBucket = 'reference-documents';
  
  constructor() {
    try {
      // Initialize Supabase client with service role key for system operations
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
      }
      
      this.supabase = createClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
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
      
      console.log('SupabaseReferenceManager initialized successfully');
    } catch (error) {
      console.error('Error initializing SupabaseReferenceManager:', error);
      throw new Error(`Failed to initialize SupabaseReferenceManager: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });
  }

  /**
   * Initialize the reference document system by loading all documents
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Supabase reference document system...');
      
      // Check if we have any documents in the database
      const { data: existingDocs, error } = await this.supabase
        .from('reference_documents')
        .select('id, title')
        .limit(1);

      if (error) {
        console.error('Error checking existing documents:', error);
        throw error;
      }

      if (!existingDocs || existingDocs.length === 0) {
        console.log('No documents found in database, loading from files...');
        await this.loadAllDocuments();
      } else {
        console.log(`Found ${existingDocs.length} existing documents in database`);
      }
    } catch (error) {
      console.error('Error initializing reference document system:', error);
      throw error;
    }
  }

  /**
   * Load all documents from the reference_documents directory
   */
  async loadAllDocuments(): Promise<void> {
    try {
      const files = await this.getDocumentFiles(this.documentsPath);
      console.log(`Found ${files.length} document files to process`);
      
      for (const filePath of files) {
        try {
          await this.processDocument(filePath);
          console.log(`Successfully processed: ${path.basename(filePath)}`);
        } catch (error) {
          console.error(`Error processing ${filePath}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      throw error;
    }
  }

  /**
   * Process a single document: extract content, create embeddings, and store in database
   */
  async processDocument(filePath: string): Promise<string> {
    try {
      const filename = path.basename(filePath);
      const fileContent = await fs.readFile(filePath);
      const contentHash = createHash('sha256').update(fileContent).digest('hex');
      
      // Check if document already exists
      const { data: existingDoc } = await this.supabase
        .from('reference_documents')
        .select('id, content_hash')
        .eq('content_hash', contentHash)
        .single();

      if (existingDoc) {
        console.log(`Document ${filename} already exists in database`);
        return existingDoc.id;
      }

      // Load and split document
      const documents = await this.loadDocument(filePath);
      const chunks = await this.textSplitter.splitDocuments(documents);
      
      if (chunks.length === 0) {
        throw new Error(`No content extracted from ${filename}`);
      }

      // Create reference document record
      const { data: refDoc, error: docError } = await this.supabase
        .from('reference_documents')
        .insert({
          title: this.extractTitle(filename),
          description: `Reference document: ${filename}`,
          source: this.extractSource(filePath),
          document_type: this.extractDocumentType(filePath),
          file_path: filePath,
          content_hash: contentHash,
          metadata: {
            filename: filename,
            file_size: fileContent.length,
            chunk_count: chunks.length
          },
          language: 'en',
          is_active: true
        })
        .select('id')
        .single();

      if (docError) {
        console.error('Error creating reference document:', docError);
        throw docError;
      }

      if (!refDoc) {
        throw new Error('Failed to create reference document');
      }

      // Generate embeddings and store chunks
      console.log(`Generating embeddings for ${chunks.length} chunks...`);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkContent = chunk.pageContent.trim();
        
        if (chunkContent.length === 0) continue;
        
        try {
          // Generate embedding
          const embedding = await this.embeddings.embedQuery(chunkContent);
          const chunkContentHash = createHash('sha256').update(chunkContent).digest('hex');
          
          // Store chunk embedding
          const { error: embeddingError } = await this.supabase
            .from('document_embeddings')
            .insert({
              document_id: refDoc.id,
              chunk_index: i,
              content: chunkContent,
              content_hash: chunkContentHash,
              embedding: embedding,
              metadata: {
                ...chunk.metadata,
                filename: filename,
                total_chunks: chunks.length
              },
              token_count: this.estimateTokenCount(chunkContent)
            });

          if (embeddingError) {
            console.error(`Error storing embedding for chunk ${i}:`, embeddingError);
          }
        } catch (error) {
          console.error(`Error processing chunk ${i}:`, error);
        }
      }

      console.log(`Successfully processed ${filename} with ${chunks.length} chunks`);
      return refDoc.id;
    } catch (error) {
      console.error(`Error processing document ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Search for relevant documents using vector similarity
   */
  async searchRelevantDocuments(query: string, topK: number = 5, minSimilarity: number = 0.7): Promise<SearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.embeddings.embedQuery(query);
      
      // Search for similar embeddings using pgvector cosine similarity
      const { data: results, error } = await this.supabase.rpc('search_document_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: minSimilarity,
        match_count: topK
      });

      if (error) {
        console.error('Error searching embeddings:', error);
        throw error;
      }

      if (!results || results.length === 0) {
        console.log('No relevant documents found');
        return [];
      }

      // Transform results
      return results.map((result: {
        content: string;
        metadata: Record<string, string | number | boolean>;
        similarity: number;
        document_title?: string;
        document_source?: string;
        chunk_index: number;
      }) => ({
        content: result.content,
        metadata: result.metadata || {},
        similarity: result.similarity,
        document_title: result.document_title,
        document_source: result.document_source,
        chunk_index: result.chunk_index
      }));
    } catch (error) {
      console.error('Error searching relevant documents:', error);
      return [];
    }
  }

  /**
   * Get contextual information for LLM
   */
  async getContextForQuery(query: string, topK: number = 3): Promise<string> {
    try {
      const relevantDocs = await this.searchRelevantDocuments(query, topK);
      
      if (relevantDocs.length === 0) {
        return '';
      }

      const context = relevantDocs
        .map((doc, index) => {
          const source = doc.document_source || doc.document_title || 'Unknown';
          const similarity = (doc.similarity * 100).toFixed(1);
          return `[Reference ${index + 1} from ${source} (${similarity}% relevant)]:\n${doc.content}`;
        })
        .join('\n\n');

      return context;
    } catch (error) {
      console.error('Error getting context:', error);
      return '';
    }
  }

  /**
   * Add a new document to the system
   */
  async addDocument(filePath: string): Promise<string> {
    try {
      console.log(`Adding new document: ${path.basename(filePath)}`);
      return await this.processDocument(filePath);
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  /**
   * Remove a document and all its embeddings
   */
  async removeDocument(documentId: string): Promise<void> {
    try {
      // Delete embeddings first (CASCADE should handle this, but being explicit)
      const { error: embeddingError } = await this.supabase
        .from('document_embeddings')
        .delete()
        .eq('document_id', documentId);

      if (embeddingError) {
        console.error('Error deleting embeddings:', embeddingError);
      }

      // Delete reference document
      const { error: docError } = await this.supabase
        .from('reference_documents')
        .delete()
        .eq('id', documentId);

      if (docError) {
        throw docError;
      }

      console.log(`Successfully removed document ${documentId}`);
    } catch (error) {
      console.error('Error removing document:', error);
      throw error;
    }
  }

  /**
   * Get statistics about the document system
   */
  async getStats(): Promise<{
    documentCount: number;
    embeddingCount: number;
    activeDocumentCount: number;
    totalTokens: number;
  }> {
    try {
      // Get document counts
      const { data: docStats, error: docError } = await this.supabase
        .from('reference_documents')
        .select('is_active', { count: 'exact' });

      if (docError) throw docError;

      const documentCount = docStats?.length || 0;
      const activeDocumentCount = docStats?.filter(doc => doc.is_active).length || 0;

      // Get embedding count and token sum
      const { data: embeddingStats, error: embeddingError } = await this.supabase
        .from('document_embeddings')
        .select('token_count', { count: 'exact' });

      if (embeddingError) throw embeddingError;

      const embeddingCount = embeddingStats?.length || 0;
      const totalTokens = embeddingStats?.reduce((sum, row) => sum + (row.token_count || 0), 0) || 0;

      return {
        documentCount,
        embeddingCount,
        activeDocumentCount,
        totalTokens
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        documentCount: 0,
        embeddingCount: 0,
        activeDocumentCount: 0,
        totalTokens: 0
      };
    }
  }

  /**
   * Rebuild the entire embedding system
   */
  async rebuildEmbeddings(): Promise<void> {
    try {
      console.log('Rebuilding embeddings system...');
      
      // Delete all embeddings
      const { error: deleteError } = await this.supabase
        .from('document_embeddings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) {
        console.error('Error deleting embeddings:', deleteError);
      }

      // Delete all reference documents
      const { error: deleteDocError } = await this.supabase
        .from('reference_documents')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteDocError) {
        console.error('Error deleting reference documents:', deleteDocError);
      }

      // Reload all documents
      await this.loadAllDocuments();
      
      console.log('Embeddings system rebuilt successfully');
    } catch (error) {
      console.error('Error rebuilding embeddings:', error);
      throw error;
    }
  }

  /**
   * Upload documents from local directory to Supabase storage and process them
   */
  async uploadDocumentsToStorage(): Promise<void> {
    try {
      console.log('Uploading documents to Supabase storage...');
      
      const files = await this.getDocumentFiles(this.documentsPath);
      
      for (const filePath of files) {
        try {
          const filename = path.basename(filePath);
          const fileContent = await fs.readFile(filePath);
          
          // Check if file already exists in storage
          const { data: existingFile } = await this.supabase.storage
            .from(this.storageBucket)
            .list('', { search: filename });
          
          if (!existingFile?.find(f => f.name === filename)) {
            // Upload to storage
            const { error: uploadError } = await this.supabase.storage
              .from(this.storageBucket)
              .upload(filename, fileContent, {
                contentType: this.getContentType(filePath),
                upsert: true
              });
            
            if (uploadError) {
              console.error(`Error uploading ${filename}:`, uploadError);
              continue;
            }
            
            console.log(`Uploaded ${filename} to storage`);
          }
          
          // Process the document for embeddings
          await this.processDocumentFromStorage(filename, filePath);
        } catch (error) {
          console.error(`Error processing ${filePath}:`, error);
        }
      }
    } catch (error) {
      console.error('Error uploading documents to storage:', error);
      throw error;
    }
  }

  /**
   * Process a document from Supabase storage
   */
  async processDocumentFromStorage(filename: string, localPath?: string): Promise<string> {
    try {
      let fileContent: Buffer;
      
      if (localPath) {
        // Use local file if available
        fileContent = await fs.readFile(localPath);
      } else {
        // Download from Supabase storage
        const { data, error } = await this.supabase.storage
          .from(this.storageBucket)
          .download(filename);
        
        if (error) {
          throw new Error(`Failed to download ${filename}: ${error.message}`);
        }
        
        fileContent = Buffer.from(await data.arrayBuffer());
      }
      
      const contentHash = createHash('sha256').update(fileContent).digest('hex');
      
      // Check if document already exists
      const { data: existingDoc } = await this.supabase
        .from('reference_documents')
        .select('id, content_hash')
        .eq('content_hash', contentHash)
        .single();

      if (existingDoc) {
        console.log(`Document ${filename} already exists in database`);
        return existingDoc.id;
      }

      // Load and split document
      const documents = localPath ? 
        await this.loadDocument(localPath) : 
        await this.loadDocumentFromBuffer(fileContent, filename);
      
      const chunks = await this.textSplitter.splitDocuments(documents);
      
      if (chunks.length === 0) {
        throw new Error(`No content extracted from ${filename}`);
      }

      // Get storage URL
      const { data: urlData } = await this.supabase.storage
        .from(this.storageBucket)
        .createSignedUrl(filename, 3600 * 24 * 365); // 1 year expiry

      // Create reference document record
      const { data: refDoc, error: docError } = await this.supabase
        .from('reference_documents')
        .insert({
          title: this.extractTitle(filename),
          description: `Reference document: ${filename}`,
          source: this.extractSourceFromStorage(filename),
          document_type: this.extractDocumentType(filename),
          file_path: urlData?.signedUrl || filename,
          content_hash: contentHash,
          metadata: {
            filename: filename,
            file_size: fileContent.length,
            chunk_count: chunks.length,
            storage_path: filename,
            content_type: this.getContentType(filename)
          },
          language: 'en',
          is_active: true
        })
        .select('id')
        .single();

      if (docError) {
        console.error('Error creating reference document:', docError);
        throw docError;
      }

      if (!refDoc) {
        throw new Error('Failed to create reference document');
      }

      // Generate embeddings and store chunks
      console.log(`Generating embeddings for ${chunks.length} chunks...`);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkContent = chunk.pageContent.trim();
        
        if (chunkContent.length === 0) continue;
        
        try {
          // Generate embedding
          const embedding = await this.embeddings.embedQuery(chunkContent);
          const chunkContentHash = createHash('sha256').update(chunkContent).digest('hex');
          
          // Store chunk embedding
          const { error: embeddingError } = await this.supabase
            .from('document_embeddings')
            .insert({
              document_id: refDoc.id,
              chunk_index: i,
              content: chunkContent,
              content_hash: chunkContentHash,
              embedding: embedding,
              metadata: {
                ...chunk.metadata,
                filename: filename,
                total_chunks: chunks.length,
                storage_path: filename
              },
              token_count: this.estimateTokenCount(chunkContent)
            });

          if (embeddingError) {
            console.error(`Error storing embedding for chunk ${i}:`, embeddingError);
          }
        } catch (error) {
          console.error(`Error processing chunk ${i}:`, error);
        }
      }

      console.log(`Successfully processed ${filename} with ${chunks.length} chunks`);
      return refDoc.id;
    } catch (error) {
      console.error(`Error processing document from storage ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Load document from buffer for various file types
   */
  async loadDocumentFromBuffer(buffer: Buffer, filename: string): Promise<Document[]> {
    const extension = path.extname(filename).toLowerCase();
    
    try {
      if (extension === '.pdf') {
        // For PDF, we need to save temporarily and use PDFLoader
        const tempPath = path.join(process.cwd(), 'temp', filename);
        await fs.mkdir(path.dirname(tempPath), { recursive: true });
        await fs.writeFile(tempPath, buffer);
        
        const loader = new PDFLoader(tempPath);
        const docs = await loader.load();
        
        // Clean up temp file
        await fs.unlink(tempPath);
        
        return docs;
      } else if (['.txt', '.md'].includes(extension)) {
        const content = buffer.toString('utf-8');
        return [new Document({
          pageContent: content,
          metadata: { filename, source: filename }
        })];
      } else {
        // For other file types, try to extract text content
        const content = buffer.toString('utf-8');
        return [new Document({
          pageContent: content,
          metadata: { filename, source: filename }
        })];
      }
    } catch (error) {
      console.error(`Error loading document from buffer ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Get all documents from Supabase storage
   */
  async listStorageDocuments(): Promise<Array<{name: string; size: number; lastModified: string}>> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.storageBucket)
        .list('', {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        console.error('Error listing storage documents:', error);
        return [];
      }
      
      return data?.filter(file => 
        file.name.endsWith('.pdf') || 
        file.name.endsWith('.txt') || 
        file.name.endsWith('.md')
      ).map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        lastModified: file.updated_at || file.created_at || ''
      })) || [];
    } catch (error) {
      console.error('Error listing storage documents:', error);
      return [];
    }
  }

  /**
   * Get document download URL from storage
   */
  async getDocumentUrl(filename: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.storageBucket)
        .createSignedUrl(filename, 3600); // 1 hour expiry
      
      if (error) {
        console.error(`Error getting URL for ${filename}:`, error);
        return null;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error(`Error getting document URL for ${filename}:`, error);
      return null;
    }
  }

  /**
   * Get enhanced RAG context with document metadata and URLs
   */
  async getEnhancedRagContext(query: string, topK: number = 5): Promise<Array<RagContext & {
    document_url?: string;
    document_metadata?: Record<string, string | number | boolean>;
    chunk_index: number;
  }>> {
    try {
      const searchResults = await this.searchRelevantDocuments(query, topK);
      
      const enhancedResults = await Promise.all(
        searchResults.map(async (result) => {
          // Get document metadata
          const { data: docData } = await this.supabase
            .from('reference_documents')
            .select('metadata, file_path')
            .eq('title', result.document_title || '')
            .single();
          
          // Get download URL if stored in Supabase
          let documentUrl = null;
          if (docData?.metadata?.storage_path) {
            documentUrl = await this.getDocumentUrl(docData.metadata.storage_path);
          }
          
          return {
            content: result.content,
            metadata: result.metadata,
            similarity: result.similarity,
            document_title: result.document_title,
            document_source: result.document_source,
            chunk_index: result.chunk_index,
            document_url: documentUrl || undefined,
            document_metadata: docData?.metadata as Record<string, string | number | boolean> || {}
          };
        })
      );
      
      return enhancedResults;
    } catch (error) {
      console.error('Error getting enhanced RAG context:', error);
      return [];
    }
  }

  /**
   * Get analytics data for dashboard
   */
  async getAnalyticsData(): Promise<{
    totalDocuments: number;
    totalEmbeddings: number;
    averageChunksPerDocument: number;
    documentTypes: Record<string, number>;
    recentlyAdded: ReferenceDocument[];
  }> {
    try {
      // Get total documents
      const { count: totalDocuments } = await this.supabase
        .from('reference_documents')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      // Get total embeddings
      const { count: totalEmbeddings } = await this.supabase
        .from('document_embeddings')
        .select('*', { count: 'exact', head: true });
      
      // Get document types distribution
      const { data: typeData } = await this.supabase
        .from('reference_documents')
        .select('document_type')
        .eq('is_active', true);
      
      const documentTypes: Record<string, number> = {};
      typeData?.forEach(doc => {
        const type = doc.document_type || 'general';
        documentTypes[type] = (documentTypes[type] || 0) + 1;
      });
      
      // Get recently added documents
      const { data: recentDocs } = await this.supabase
        .from('reference_documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      return {
        totalDocuments: totalDocuments || 0,
        totalEmbeddings: totalEmbeddings || 0,
        averageChunksPerDocument: totalDocuments ? Math.round((totalEmbeddings || 0) / totalDocuments) : 0,
        documentTypes,
        recentlyAdded: recentDocs as ReferenceDocument[] || []
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return {
        totalDocuments: 0,
        totalEmbeddings: 0,
        averageChunksPerDocument: 0,
        documentTypes: {},
        recentlyAdded: []
      };
    }
  }

  /**
   * Get all document files from a directory recursively
   */
  private async getDocumentFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getDocumentFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.pdf', '.txt', '.md', '.doc', '.docx'].includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
    }
    
    return files;
  }

  /**
   * Load document based on file type
   */
  private async loadDocument(filePath: string): Promise<Document[]> {
    const extension = path.extname(filePath).toLowerCase();
    
    try {
      if (extension === '.pdf') {
        const loader = new PDFLoader(filePath);
        return await loader.load();
      } else if (['.txt', '.md'].includes(extension)) {
        const loader = new TextLoader(filePath);
        return await loader.load();
      } else {
        // For other file types, try to read as text
        const content = await fs.readFile(filePath, 'utf-8');
        return [new Document({
          pageContent: content,
          metadata: { source: filePath }
        })];
      }
    } catch (error) {
      console.error(`Error loading document ${filePath}:`, error);
      throw error;
    }
  }

  private extractTitle(filename: string): string {
    return path.parse(filename).name.replace(/[_-]/g, ' ');
  }

  private extractSource(filePath: string): string {
    const pathParts = filePath.split(path.sep);
    if (pathParts.includes('research_papers')) return 'Research Paper';
    if (pathParts.includes('best_practices')) return 'Best Practice Guide';
    if (pathParts.includes('disease_guides')) return 'Disease Guide';
    if (pathParts.includes('case_studies')) return 'Case Study';
    return 'Reference Document';
  }

  private extractDocumentType(filePath: string): string {
    const filename = path.basename(filePath).toLowerCase();
    if (filename.includes('fertilizer') || filename.includes('nutrient')) return 'fertilizer_guide';
    if (filename.includes('disease') || filename.includes('pest')) return 'disease_guide';
    if (filename.includes('cultivation') || filename.includes('planting')) return 'cultivation_guide';
    if (filename.includes('research') || filename.includes('study')) return 'research_paper';
    return 'general_reference';
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  private getContentType(filename: string): string {
    const extension = path.extname(filename).toLowerCase();
    switch (extension) {
      case '.pdf': return 'application/pdf';
      case '.txt': return 'text/plain';
      case '.md': return 'text/markdown';
      case '.doc': return 'application/msword';
      case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default: return 'application/octet-stream';
    }
  }

  private extractSourceFromStorage(filename: string): string {
    const lowerName = filename.toLowerCase();
    if (lowerName.includes('research') || lowerName.includes('study')) return 'Research Paper';
    if (lowerName.includes('best_practice') || lowerName.includes('guide')) return 'Best Practice Guide';
    if (lowerName.includes('disease') || lowerName.includes('pest')) return 'Disease Guide';
    if (lowerName.includes('case_study')) return 'Case Study';
    if (lowerName.includes('fertilizer') || lowerName.includes('nutrient')) return 'Fertilizer Guide';
    return 'Reference Document';
  }

  /**
   * Automatically process all documents in Supabase storage with standardized naming
   */
  async processAllStorageDocuments(): Promise<{
    processed: number;
    skipped: number;
    errors: string[];
  }> {
    const results = {
      processed: 0,
      skipped: 0,
      errors: [] as string[]
    };

    try {
      console.log('Starting automated document processing...');
      
      // List all documents in storage
      const storageDocuments = await this.listStorageDocuments();
      
      for (const doc of storageDocuments) {
        try {
          // Check if document already processed
          const { data: existingDoc } = await this.supabase
            .from('reference_documents')
            .select('id')
            .eq('metadata->>storage_path', doc.name)
            .single();

          if (existingDoc) {
            console.log(`Skipping already processed document: ${doc.name}`);
            results.skipped++;
            continue;
          }

          // Process the document
          await this.processDocumentFromStorage(doc.name);
          results.processed++;
          
          console.log(`Successfully processed: ${doc.name}`);
        } catch (error) {
          const errorMsg = `Failed to process ${doc.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log(`Document processing completed. Processed: ${results.processed}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`);
      return results;
    } catch (error) {
      console.error('Failed to process storage documents:', error);
      throw error;
    }
  }

  /**
   * Initialize document embeddings for all reference documents
   */
  async initializeAllEmbeddings(): Promise<void> {
    try {
      console.log('Initializing embeddings for all reference documents...');
      
      // Get all documents without embeddings
      const { data: documentsNeedingEmbeddings } = await this.supabase
        .from('reference_documents')
        .select(`
          id,
          title,
          metadata,
          file_path
        `)
        .eq('is_active', true);

      if (!documentsNeedingEmbeddings || documentsNeedingEmbeddings.length === 0) {
        console.log('No documents found needing embeddings');
        return;
      }

      for (const doc of documentsNeedingEmbeddings) {
        try {
          // Check if embeddings already exist
          const { count } = await this.supabase
            .from('document_embeddings')
            .select('*', { count: 'exact', head: true })
            .eq('document_id', doc.id);

          if (count && count > 0) {
            console.log(`Embeddings already exist for: ${doc.title}`);
            continue;
          }

          // Get storage path from metadata
          const storagePath = doc.metadata?.storage_path as string;
          if (storagePath) {
            await this.processDocumentFromStorage(storagePath);
            console.log(`Generated embeddings for: ${doc.title}`);
          } else {
            console.warn(`No storage path found for document: ${doc.title}`);
          }
        } catch (error) {
          console.error(`Failed to generate embeddings for ${doc.title}:`, error);
        }
      }

      console.log('Embedding initialization completed');
    } catch (error) {
      console.error('Failed to initialize embeddings:', error);
      throw error;
    }
  }

  /**
   * Standardize document naming and categorization
   */
  private standardizeDocumentMetadata(filename: string, content: string): {
    standardizedName: string;
    category: string;
    documentType: string;
    keywords: string[];
    region: string;
  } {
    const lowerName = filename.toLowerCase();
    const lowerContent = content.toLowerCase().substring(0, 2000); // First 2KB for analysis
    
    // Standardized naming patterns
    let standardizedName = filename;
    let category = 'general';
    let documentType = 'reference';
    let region = 'malaysia';
    
    // Categorize by content and filename
    if (lowerName.includes('soil') || lowerContent.includes('soil analysis')) {
      category = 'soil_analysis';
      documentType = 'analytical_guide';
      standardizedName = `soil_${this.generateDocumentId(filename)}.pdf`;
    } else if (lowerName.includes('leaf') || lowerContent.includes('foliar') || lowerContent.includes('frond')) {
      category = 'leaf_analysis';
      documentType = 'analytical_guide';
      standardizedName = `leaf_${this.generateDocumentId(filename)}.pdf`;
    } else if (lowerName.includes('fertilizer') || lowerContent.includes('nutrient management')) {
      category = 'fertilizer_management';
      documentType = 'management_guide';
      standardizedName = `fertilizer_${this.generateDocumentId(filename)}.pdf`;
    } else if (lowerName.includes('disease') || lowerContent.includes('pest')) {
      category = 'disease_management';
      documentType = 'diagnostic_guide';
      standardizedName = `disease_${this.generateDocumentId(filename)}.pdf`;
    } else if (lowerName.includes('research') || lowerContent.includes('journal')) {
      category = 'research_paper';
      documentType = 'scientific_paper';
      standardizedName = `research_${this.generateDocumentId(filename)}.pdf`;
    }

    // Extract keywords for better searchability
    const keywords = this.extractDocumentKeywords(lowerContent, category);
    
    // Determine region
    if (lowerContent.includes('sabah') || lowerContent.includes('sarawak')) {
      region = 'east_malaysia';
    } else if (lowerContent.includes('peninsular') || lowerContent.includes('west malaysia')) {
      region = 'peninsular_malaysia';
    }

    return {
      standardizedName,
      category,
      documentType,
      keywords,
      region
    };
  }

  /**
   * Generate unique document ID based on content hash
   */
  private generateDocumentId(filename: string): string {
    const baseName = path.parse(filename).name;
    const cleanName = baseName.replace(/[^\w]/g, '_').substring(0, 20);
    const timestamp = Date.now().toString().slice(-6);
    return `${cleanName}_${timestamp}`;
  }

  /**
   * Extract relevant keywords from document content
   */
  private extractDocumentKeywords(content: string, category: string): string[] {
    const baseKeywords = ['oil_palm', 'malaysia', 'plantation', 'agriculture'];
    
    const categoryKeywords: Record<string, string[]> = {
      soil_analysis: ['soil_fertility', 'pH', 'nutrient_analysis', 'soil_preparation', 'organic_matter'],
      leaf_analysis: ['foliar_nutrition', 'frond_analysis', 'nutrient_deficiency', 'leaf_symptoms'],
      fertilizer_management: ['NPK', 'fertilizer_application', 'nutrient_management', 'yield_optimization'],
      disease_management: ['pest_control', 'disease_prevention', 'integrated_pest_management'],
      research_paper: ['research_findings', 'field_trials', 'experimental_results']
    };

    let keywords = [...baseKeywords, ...(categoryKeywords[category] || [])];

    // Extract additional keywords from content
    const contentKeywords = [
      'tenera', 'dura', 'pisifera', 'mpob', 'rspo', 'sustainable',
      'yield', 'productivity', 'ffb', 'palm_oil', 'cultivation'
    ].filter(keyword => content.includes(keyword));

    keywords = [...keywords, ...contentKeywords];

    return Array.from(new Set(keywords)); // Remove duplicates
  }
}

// Create and export a singleton instance
let referenceManager: SupabaseReferenceManager | null = null;

export function getSupabaseReferenceManager(): SupabaseReferenceManager {
  if (!referenceManager) {
    referenceManager = new SupabaseReferenceManager();
  }
  return referenceManager;
}
