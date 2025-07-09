import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseReferenceManager } from '@/lib/supabase-reference-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const query = searchParams.get('query');
    const filename = searchParams.get('filename');
    
    const referenceManager = getSupabaseReferenceManager();
    
    switch (action) {
      case 'list':
        // List all documents in storage
        const documents = await referenceManager.listStorageDocuments();
        return NextResponse.json({ documents });
        
      case 'analytics':
        // Get analytics data
        const analytics = await referenceManager.getAnalyticsData();
        return NextResponse.json(analytics);
        
      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required for search' }, { status: 400 });
        }
        // Enhanced RAG search
        const results = await referenceManager.getEnhancedRagContext(query, 10);
        return NextResponse.json({ results });
        
      case 'download-url':
        if (!filename) {
          return NextResponse.json({ error: 'Filename parameter required' }, { status: 400 });
        }
        // Get download URL
        const url = await referenceManager.getDocumentUrl(filename);
        return NextResponse.json({ url });
        
      case 'stats':
        // Get system stats
        const stats = await referenceManager.getStats();
        return NextResponse.json(stats);
        
      default:
        // Default: return basic document list and analytics
        const [docList, analyticsData] = await Promise.all([
          referenceManager.listStorageDocuments(),
          referenceManager.getAnalyticsData()
        ]);
        
        return NextResponse.json({
          documents: docList,
          analytics: analyticsData
        });
    }
  } catch (error) {
    console.error('Error in reference documents API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    const referenceManager = getSupabaseReferenceManager();
    
    switch (action) {
      case 'upload-to-storage':
        // Upload local documents to Supabase storage
        await referenceManager.uploadDocumentsToStorage();
        return NextResponse.json({ success: true, message: 'Documents uploaded successfully' });
        
      case 'initialize':
        // Initialize the reference system
        await referenceManager.initialize();
        return NextResponse.json({ success: true, message: 'Reference system initialized' });
        
      case 'rebuild':
        // Rebuild embeddings
        await referenceManager.rebuildEmbeddings();
        return NextResponse.json({ success: true, message: 'Embeddings rebuilt successfully' });
        
      case 'process-all-documents':
        // Process all documents in storage with standardized naming
        const results = await referenceManager.processAllStorageDocuments();
        return NextResponse.json({ 
          success: true, 
          message: 'Document processing completed',
          results 
        });
        
      case 'initialize-embeddings':
        // Initialize embeddings for all documents
        await referenceManager.initializeAllEmbeddings();
        return NextResponse.json({ 
          success: true, 
          message: 'Embeddings initialized for all documents' 
        });
        
      case 'full-system-setup':
        // Complete system setup: upload, process, and embed
        try {
          // Step 1: Upload documents to storage
          await referenceManager.uploadDocumentsToStorage();
          
          // Step 2: Process all documents with standardized naming
          const processResults = await referenceManager.processAllStorageDocuments();
          
          // Step 3: Initialize embeddings
          await referenceManager.initializeAllEmbeddings();
          
          // Step 4: Get final analytics
          const analytics = await referenceManager.getAnalyticsData();
          
          return NextResponse.json({
            success: true,
            message: 'Complete system setup completed successfully',
            processResults,
            analytics
          });
        } catch (error) {
          console.error('Full system setup failed:', error);
          return NextResponse.json({
            success: false,
            error: 'Full system setup failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in reference documents POST API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
