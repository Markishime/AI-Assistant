import { NextRequest, NextResponse } from 'next/server';
import { CloudClient } from "chromadb";

// Initialize Chroma Cloud client
const chromaClient = new CloudClient({
  apiKey: 'ck-4jKetkJctgX9gLuEtqY2E6DHDvAiAMN7YbiuM7i82DFc',
  tenant: '0c1519c2-038f-418e-a2a0-c3765e34c7df',
  database: 'AGS'
});

export async function GET() {
  try {
    // Test connection by listing collections
    const collections = await chromaClient.listCollections();
    
    // Try to get or create our test collection
    const testCollection = await chromaClient.getOrCreateCollection({
      name: "test_connection",
      metadata: {
        description: "Test collection to verify Chroma Cloud connection",
        created: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Chroma Cloud connection successful",
      collections: collections.map(c => c.name),
      testCollection: {
        name: testCollection.name,
        id: testCollection.id
      }
    });
  } catch (error) {
    console.error('Chroma connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: "Failed to connect to Chroma Cloud"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { testData } = await req.json();
    
    // Get or create collection
    const testCollection = await chromaClient.getOrCreateCollection({
      name: "test_connection"
    });

    // Add test document
    const testId = `test_${Date.now()}`;
    await testCollection.add({
      ids: [testId],
      documents: [testData || "Test document for Chroma Cloud connection"],
      metadatas: [{
        type: "test",
        timestamp: new Date().toISOString()
      }]
    });

    // Query the document
    const queryResult = await testCollection.query({
      queryTexts: ["test document"],
      nResults: 1
    });

    return NextResponse.json({
      success: true,
      message: "Test document added and queried successfully",
      testId,
      queryResults: queryResult
    });
  } catch (error) {
    console.error('Chroma test operation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: "Failed to perform test operations"
    }, { status: 500 });
  }
}
