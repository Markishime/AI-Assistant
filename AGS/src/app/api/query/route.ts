import { NextRequest, NextResponse } from "next/server";
import { ragService } from "@/lib/rag-service";

interface QueryRequest {
  query: string;
  limit?: number;
  include_context?: boolean;
  max_tokens?: number;
}

export async function POST(request: NextRequest) {
  try {
    const data: QueryRequest = await request.json();

    if (!data.query || typeof data.query !== 'string') {
      return NextResponse.json(
        { success: false, message: "Query string is required" },
        { status: 400 }
      );
    }

    const limit = data.limit || 5;
    const includeContext = data.include_context || false;
    const maxTokens = data.max_tokens || 4000;

    if (includeContext) {
      // Get relevant context for RAG applications
      const contextResult = await ragService.getRelevantContext(data.query, maxTokens);
      
      if (!contextResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Failed to retrieve context",
            error: contextResult.error
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Context retrieved successfully",
        data: {
          query: data.query,
          context: contextResult.context,
          sources: contextResult.sources,
          token_estimate: Math.ceil(contextResult.context.length / 4)
        }
      });
    } else {
      // Standard query for individual results
      const queryResult = await ragService.query(data.query, { 
        limit,
        includeDistances: true 
      });

      if (!queryResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Failed to query documents",
            error: queryResult.error
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Query executed successfully",
        data: {
          query: data.query,
          results: queryResult.results,
          total_results: queryResult.results.length
        }
      });
    }
  } catch (error) {
    console.error("Error in /api/query:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// GET method for simple queries via URL parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');
    const context = searchParams.get('context') === 'true';

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    if (context) {
      const contextResult = await ragService.getRelevantContext(query);
      
      return NextResponse.json({
        success: true,
        data: {
          query,
          context: contextResult.context,
          sources: contextResult.sources
        }
      });
    } else {
      const queryResult = await ragService.query(query, { limit });
      
      return NextResponse.json({
        success: true,
        data: {
          query,
          results: queryResult.results
        }
      });
    }
  } catch (error) {
    console.error("Error in GET /api/query:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to execute query",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
