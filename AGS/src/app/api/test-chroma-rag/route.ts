import { NextRequest, NextResponse } from 'next/server';
import { ChromaReferenceManager } from '@/lib/chroma-reference-manager';

export async function GET() {
  try {
    const manager = new ChromaReferenceManager();
    
    // Initialize collection
    await manager.initializeCollection();
    
    // Get collection statistics
    const stats = await manager.getCollectionStats();
    
    return NextResponse.json({
      success: true,
      message: "ChromaDB RAG integration successful",
      stats
    });
  } catch (error) {
    console.error('ChromaDB RAG test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: "Failed to initialize ChromaDB RAG system"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query, limit = 5 } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Query is required and must be a string'
      }, { status: 400 });
    }
    
    const manager = new ChromaReferenceManager();
    await manager.initializeCollection();
    
    // Search for relevant documents
    const results = await manager.searchRelevantDocuments(query, limit);
    
    return NextResponse.json({
      success: true,
      query,
      results: results.map(doc => ({
        id: doc.id,
        content: doc.content.substring(0, 500) + (doc.content.length > 500 ? '...' : ''),
        metadata: {
          source: doc.metadata.source,
          type: doc.metadata.type,
          similarity_score: doc.metadata.similarity_score,
          filename: doc.metadata.filename
        }
      }))
    });
  } catch (error) {
    console.error('ChromaDB search failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: "Failed to search ChromaDB"
    }, { status: 500 });
  }
}
