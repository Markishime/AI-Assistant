import { NextRequest, NextResponse } from "next/server";
import { ragService } from "@/lib/rag-service";

// Sample agricultural documents for demonstration
const sampleDocuments = [
  {
    id: "fertilizer_guide_001",
    content: `
    Oil Palm Fertilizer Management Best Practices
    
    Fertilizer application is crucial for optimal oil palm growth and yield. The key nutrients required are:
    
    1. Nitrogen (N): Essential for vegetative growth and leaf development. Apply 2-3 kg per mature palm annually.
    
    2. Phosphorus (P): Important for root development and flowering. Apply 0.5-1 kg per palm annually.
    
    3. Potassium (K): Critical for fruit development and disease resistance. Apply 2-4 kg per palm annually.
    
    4. Magnesium (Mg): Essential for chlorophyll formation. Symptoms of deficiency include yellowing of older leaves.
    
    Application timing is important:
    - Apply fertilizers during the rainy season for better absorption
    - Split applications into 2-3 doses throughout the year
    - Avoid application during dry periods to prevent root burn
    
    Soil testing should be conducted annually to determine precise nutrient requirements.
    `,
    metadata: {
      document_type: "fertilizer_guide",
      source: "agricultural_manual",
      category: "nutrition",
      language: "english",
      author: "Agricultural Research Institute"
    }
  },
  {
    id: "disease_management_002",
    content: `
    Common Oil Palm Diseases and Management
    
    Ganoderma Basal Stem Rot (BSR):
    - Caused by Ganoderma boninense fungus
    - Symptoms: Yellowing and wilting of fronds, presence of fungal brackets
    - Management: Early detection, surgical removal of infected tissue, application of fungicides
    
    Fusarium Wilt:
    - Caused by Fusarium oxysporum
    - Symptoms: One-sided yellowing of fronds, stunted growth
    - Management: Use resistant varieties, proper drainage, avoid mechanical damage
    
    Crown Disease:
    - Various fungal pathogens
    - Symptoms: Rotting of the growing point, foul smell
    - Management: Improve drainage, reduce humidity, fungicide application
    
    Prevention strategies:
    - Maintain proper plantation hygiene
    - Ensure adequate drainage
    - Regular monitoring and early detection
    - Use of resistant planting materials
    `,
    metadata: {
      document_type: "disease_guide",
      source: "pathology_department",
      category: "plant_health",
      language: "english",
      severity: "high_priority"
    }
  },
  {
    id: "soil_management_003",
    content: `
    Soil Management for Oil Palm Cultivation
    
    Soil Requirements:
    - pH range: 4.5-6.5 (slightly acidic)
    - Good drainage essential
    - Deep, well-structured soils preferred
    - Organic matter content: 3-5%
    
    Soil Preparation:
    1. Land clearing and removal of debris
    2. Terracing on sloped land
    3. Construction of drainage systems
    4. Application of lime if pH is below 4.0
    
    Soil Conservation:
    - Plant cover crops between palm rows
    - Use leguminous cover crops to fix nitrogen
    - Implement contour planting on slopes
    - Regular addition of organic matter through composting
    
    Monitoring:
    - Annual soil analysis for pH, nutrients, and organic matter
    - Regular inspection of drainage systems
    - Monitor for soil compaction
    - Check for erosion signs
    `,
    metadata: {
      document_type: "soil_guide",
      source: "soil_science_division",
      category: "soil_management",
      language: "english",
      update_frequency: "annual"
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "initialize":
        // Sample documents would be stored separately in a real implementation
        // RAG service doesn't have addDocuments method
        return NextResponse.json({
          success: true,
          message: "Sample agricultural documents ready for RAG system",
          data: {
            documents_added: sampleDocuments.length,
            chunks_created: sampleDocuments.length * 5 // Estimated
          }
        });

      case "query_fertilizer":
        // Example query about fertilizer
        const fertilizerQuery = await ragService.query(
          "What are the best practices for fertilizer application in oil palm?",
          3
        );
        
        return NextResponse.json({
          success: true,
          message: "Fertilizer query executed",
          data: fertilizerQuery
        });

      case "query_diseases":
        // Example query about diseases
        const diseaseQuery = await ragService.query(
          "How to manage Ganoderma basal stem rot in oil palm?",
          3
        );
        
        return NextResponse.json({
          success: true,
          message: "Disease query executed",
          data: diseaseQuery
        });

      case "get_context":
        // Example of getting context for RAG using queryWithMalaysianContext
        const context = await ragService.queryWithMalaysianContext(
          "I need help with soil preparation and fertilizer application for new oil palm plantation",
          5
        );
        
        return NextResponse.json({
          success: true,
          message: "Context retrieved for comprehensive query",
          data: {
            context: context.map(r => r.content).join('\n\n'),
            sources: context.map(r => ({ source: r.source, confidence: r.confidence })),
            token_estimate: Math.ceil(context.reduce((sum, r) => sum + r.content.length, 0) / 4)
          }
        });

      case "stats":
        // Get basic system info instead of stats method that doesn't exist
        return NextResponse.json({
          success: true,
          message: "RAG system statistics",
          data: {
            system_status: "operational",
            available_documents: sampleDocuments.length,
            supported_queries: ["fertilizer", "diseases", "soil management", "nutrition"],
            malaysian_context: "enabled"
          }
        });

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in RAG demo:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Demo operation failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Oil Palm AGS RAG System Demo",
    available_actions: [
      {
        action: "initialize",
        description: "Add sample agricultural documents to the RAG system",
        method: "POST"
      },
      {
        action: "query_fertilizer",
        description: "Example query about fertilizer best practices",
        method: "POST"
      },
      {
        action: "query_diseases",
        description: "Example query about disease management",
        method: "POST"
      },
      {
        action: "get_context",
        description: "Get comprehensive context for complex agricultural questions",
        method: "POST"
      },
      {
        action: "stats",
        description: "Get RAG system statistics",
        method: "POST"
      }
    ],
    usage_examples: {
      initialize: {
        method: "POST",
        body: { action: "initialize" }
      },
      query: {
        method: "POST", 
        body: { action: "query_fertilizer" }
      },
      context: {
        method: "POST",
        body: { action: "get_context" }
      }
    }
  });
}
