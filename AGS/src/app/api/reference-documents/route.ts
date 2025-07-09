import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseReferenceManager } from '@/lib/supabase-reference-manager';

export async function GET() {
  try {
    const documentManager = getSupabaseReferenceManager();
    
    // Initialize the reference document system
    await documentManager.initialize();
    
    // Get statistics
    const stats = await documentManager.getStats();
    
    return NextResponse.json({
      success: true,
      stats,
      message: 'Supabase reference document system initialized successfully'
    });
  } catch (error) {
    console.error('Reference documents initialization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: `Failed to initialize reference document system: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, query } = await request.json();
    const documentManager = getSupabaseReferenceManager();
    
    if (action === 'search') {
      if (!query) {
        return NextResponse.json(
          { success: false, error: 'Query parameter is required for search' },
          { status: 400 }
        );
      }
      
      const results = await documentManager.searchRelevantDocuments(query, 5);
      
      return NextResponse.json({
        success: true,
        results: results.map(doc => ({
          content: doc.content,
          source: doc.document_source || doc.document_title || 'Unknown',
          score: doc.similarity || 0,
          metadata: doc.metadata
        }))
      });
    }
    
    if (action === 'rebuild') {
      await documentManager.rebuildEmbeddings();
      const stats = await documentManager.getStats();
      
      return NextResponse.json({
        success: true,
        stats,
        message: 'Document embeddings rebuilt successfully'
      });
    }
    
    if (action === 'stats') {
      const stats = await documentManager.getStats();
      
      return NextResponse.json({
        success: true,
        stats
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action. Supported actions: search, rebuild, stats' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Reference documents API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
