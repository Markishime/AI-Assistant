import { NextRequest, NextResponse } from 'next/server';
import { getReferenceDocumentManager } from '@/lib/reference-document-manager';

export async function GET() {
  try {
    const documentManager = getReferenceDocumentManager();
    
    // Initialize vector store if not already done
    await documentManager.initializeVectorStore();
    
    // Get statistics
    const stats = await documentManager.getStats();
    
    return NextResponse.json({
      success: true,
      stats,
      message: 'Reference document system initialized successfully'
    });
  } catch (error) {
    console.error('Reference documents initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize reference document system' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, query } = await request.json();
    const documentManager = getReferenceDocumentManager();
    
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
          content: doc.pageContent,
          source: doc.metadata.source || 'Unknown',
          score: doc.metadata.score || 0
        }))
      });
    }
    
    if (action === 'rebuild') {
      await documentManager.rebuildVectorStore();
      const stats = await documentManager.getStats();
      
      return NextResponse.json({
        success: true,
        stats,
        message: 'Vector store rebuilt successfully'
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
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
