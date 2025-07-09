import { CloudClient, Collection } from "chromadb";

export class RAGService {
  private client: CloudClient | null = null;
  private collection: Collection | null = null;
  private collectionName = "agricultural_documents";
  private isConfigured = false;

  constructor() {
    try {
      // Configure CloudClient with environment variables
      const config: Record<string, string> = {};
      
      if (process.env.CHROMA_API_KEY) {
        config.apiKey = process.env.CHROMA_API_KEY;
      }
      
      if (process.env.CHROMA_TENANT) {
        config.tenant = process.env.CHROMA_TENANT;
      }
      
      if (process.env.CHROMA_DATABASE) {
        config.database = process.env.CHROMA_DATABASE;
      }

      this.client = new CloudClient(config);
      this.isConfigured = true;
    } catch (error) {
      console.warn("ChromaDB configuration failed:", error);
      this.isConfigured = false;
    }
  }

  private checkConfiguration(): boolean {
    if (!this.isConfigured || !this.client) {
      console.warn("ChromaDB is not properly configured. Please check environment variables.");
      return false;
    }
    return true;
  }

  async getCollection(): Promise<Collection | null> {
    if (!this.checkConfiguration()) {
      return null;
    }

    if (!this.collection && this.client) {
      try {
        this.collection = await this.client.getOrCreateCollection({
          name: this.collectionName,
          metadata: {
            desc: "Oil Palm Agricultural Docs",
            ver: "1.0",
            created: new Date().toISOString().split('T')[0]
          }
        });
      } catch (error) {
        console.error("Failed to get/create collection:", error);
        return null;
      }
    }
    return this.collection;
  }

  // Chunk text into smaller, manageable pieces
  chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    let currentChunk = '';
    let sentenceIndex = 0;
    
    while (sentenceIndex < sentences.length) {
      const sentence = sentences[sentenceIndex].trim() + '. ';
      
      if ((currentChunk + sentence).length <= chunkSize) {
        currentChunk += sentence;
        sentenceIndex++;
      } else {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          
          // Create overlap for better context continuity
          if (overlap > 0 && chunks.length > 0) {
            const words = currentChunk.trim().split(' ');
            const overlapWords = words.slice(-Math.min(overlap / 5, words.length / 2));
            currentChunk = overlapWords.join(' ') + ' ';
          } else {
            currentChunk = '';
          }
        } else {
          // If a single sentence is too long, just add it as is
          chunks.push(sentence);
          sentenceIndex++;
          currentChunk = '';
        }
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.length > 0 ? chunks : [text];
  }

  // Add documents to the vector store
  async addDocuments(documents: {
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
  }[]): Promise<{success: boolean; chunksAdded: number; error?: string}> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        return {
          success: false,
          chunksAdded: 0,
          error: "ChromaDB collection not available"
        };
      }
      
      const allIds: string[] = [];
      const allDocuments: string[] = [];
      const allMetadatas: Array<Record<string, string | number | boolean | null>> = [];

      for (const doc of documents) {
        const chunks = this.chunkText(doc.content);
        
        chunks.forEach((chunk, index) => {
          const chunkId = `${doc.id}_chunk_${index}`;
          allIds.push(chunkId);
          allDocuments.push(chunk);
          
          // Ensure metadata values are of correct types
          const metadata: Record<string, string | number | boolean | null> = {
            original_id: doc.id,
            chunk_index: index,
            total_chunks: chunks.length,
            timestamp: new Date().toISOString(),
            content_length: chunk.length,
            document_type: (doc.metadata?.document_type as string) || "agricultural_document"
          };

          // Add other metadata with proper type conversion
          if (doc.metadata) {
            Object.entries(doc.metadata).forEach(([key, value]) => {
              if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
                (metadata as Record<string, string | number | boolean | null>)[key] = value;
              } else {
                (metadata as Record<string, string | number | boolean | null>)[key] = String(value);
              }
            });
          }

          allMetadatas.push(metadata);
        });
      }

      await collection.add({
        ids: allIds,
        documents: allDocuments,
        metadatas: allMetadatas
      });

      return {
        success: true,
        chunksAdded: allIds.length
      };
    } catch (error) {
      console.error("Error adding documents to RAG:", error);
      return {
        success: false,
        chunksAdded: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Query the vector store for relevant documents
  async query(
    query: string, 
    options: {
      limit?: number;
      filter?: Record<string, unknown>;
      includeDistances?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    results: Array<{
      id: string;
      content: string;
      metadata: Record<string, unknown>;
      distance?: number;
    }>;
    error?: string;
  }> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        return {
          success: false,
          results: [],
          error: "ChromaDB collection not available"
        };
      }
      
      const { limit = 5, includeDistances = true } = options;

      const includeOptions = ["documents", "metadatas"];
      if (includeDistances) {
        includeOptions.push("distances");
      }

      const results = await collection.query({
        queryTexts: [query],
        nResults: limit,
        include: includeOptions as ("documents" | "metadatas" | "distances")[]
      });

      const formattedResults = [];
      
      if (results.ids && results.documents && results.metadatas) {
        for (let i = 0; i < results.ids[0].length; i++) {
          const document = results.documents[0][i];
          const distance = results.distances ? results.distances[0][i] : undefined;
          
          if (document !== null) {
            formattedResults.push({
              id: results.ids[0][i],
              content: document,
              metadata: results.metadatas[0][i] || {},
              ...(distance !== null && distance !== undefined ? { distance } : {})
            });
          }
        }
      }

      return {
        success: true,
        results: formattedResults
      };
    } catch (error) {
      console.error("Error querying RAG:", error);
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Get relevant context for a query (useful for RAG)
  async getRelevantContext(
    query: string, 
    maxTokens: number = 4000
  ): Promise<{
    success: boolean;
    context: string;
    sources: Array<{id: string; metadata: Record<string, unknown>}>;
    error?: string;
  }> {
    const queryResult = await this.query(query, { limit: 10 });
    
    if (!queryResult.success) {
      return {
        success: false,
        context: "",
        sources: [],
        error: queryResult.error
      };
    }

    let context = "";
    const sources: Array<{id: string; metadata: Record<string, unknown>}> = [];
    let tokenCount = 0;

    for (const result of queryResult.results) {
      // Rough token estimation (1 token ≈ 4 characters)
      const resultTokens = result.content.length / 4;
      
      if (tokenCount + resultTokens <= maxTokens) {
        context += result.content + "\n\n";
        sources.push({
          id: result.id,
          metadata: result.metadata
        });
        tokenCount += resultTokens;
      } else {
        break;
      }
    }

    return {
      success: true,
      context: context.trim(),
      sources
    };
  }

  // Delete documents by ID
  async deleteDocuments(ids: string[]): Promise<{success: boolean; error?: string}> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        return {
          success: false,
          error: "ChromaDB collection not available"
        };
      }
      
      await collection.delete({ ids });
      return { success: true };
    } catch (error) {
      console.error("Error deleting documents:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Get collection stats
  async getStats(): Promise<{
    success: boolean;
    stats?: {
      totalDocuments: number;
      collectionName: string;
    };
    error?: string;
  }> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        return {
          success: false,
          error: "ChromaDB collection not available"
        };
      }
      
      const count = await collection.count();
      
      return {
        success: true,
        stats: {
          totalDocuments: count,
          collectionName: this.collectionName
        }
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}

// Export a singleton instance
export const ragService = new RAGService();
