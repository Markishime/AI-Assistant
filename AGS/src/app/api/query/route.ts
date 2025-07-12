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
      // For context requests, use queryWithMalaysianContext
      const contextResults = await ragService.queryWithMalaysianContext(data.query, limit);
      
      if (!contextResults || !Array.isArray(contextResults)) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Failed to retrieve context",
            error: "No results returned"
          },
          { status: 500 }
        );
      }

      // Build context string from results
      let context = '';
      let tokenCount = 0;
      const sources = [];

      for (const result of contextResults) {
        const resultTokens = result.content.length / 4;
        if (tokenCount + resultTokens <= maxTokens) {
          context += `${result.content}\n\n`;
          sources.push({
            source: result.source,
            confidence: result.confidence,
            malaysianContextScore: result.malaysianContextScore
          });
          tokenCount += resultTokens;
        } else {
          break;
        }
      }

      return NextResponse.json({
        success: true,
        message: "Context retrieved successfully",
        data: {
          query: data.query,
          context: context.trim(),
          sources,
          token_estimate: Math.ceil(tokenCount)
        }
      });
    } else {
      // Standard query for individual results
      const queryResult = await ragService.query(data.query, limit);

      if (!queryResult || !Array.isArray(queryResult)) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Failed to query documents",
            error: "No results returned"
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Query executed successfully",
        data: {
          query: data.query,
          results: queryResult,
          total_results: queryResult.length
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
      const contextResults = await ragService.queryWithMalaysianContext(query, limit);
      
      return NextResponse.json({
        success: true,
        data: {
          query,
          context: contextResults.map(r => r.content).join('\n\n'),
          sources: contextResults.map(r => ({ source: r.source, confidence: r.confidence }))
        }
      });
    } else {
      const queryResult = await ragService.query(query, limit);
      
      return NextResponse.json({
        success: true,
        data: {
          query,
          results: queryResult
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
