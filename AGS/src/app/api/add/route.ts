import { NextRequest, NextResponse } from "next/server";
import { ragService } from "@/lib/rag-service";

interface AddDataRequest {
  documents: Array<{
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const data: AddDataRequest = await request.json();

    // Validate input
    if (!data.documents || !Array.isArray(data.documents)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid input: documents array is required" 
        },
        { status: 400 }
      );
    }

    // Validate each document
    for (const doc of data.documents) {
      if (!doc.id || !doc.content) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Each document must have an 'id' and 'content' field" 
          },
          { status: 400 }
        );
      }
    }

    // Process documents using RAG service
    const result = await ragService.addDocuments(data.documents);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to store documents in RAG system",
          error: result.error
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Documents processed and stored successfully for RAG",
      data: {
        documents_processed: data.documents.length,
        chunks_created: result.chunksAdded,
        collection: "agricultural_documents"
      },
    });
  } catch (error) {
    console.error("Error in /api/add:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 },
    );
  }
}

