import { NextRequest, NextResponse } from 'next/server';
import { dynamicPromptManager } from '@/lib/dynamic-prompt-manager';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const analytics = searchParams.get('analytics');

    if (analytics === 'true') {
      const analyticsData = await dynamicPromptManager.getTemplateAnalytics();
      return NextResponse.json({
        success: true,
        analytics: analyticsData
      });
    }

    // Get templates with optional category filter
    const templates = await dynamicPromptManager.getAllTemplates(category || undefined);
    
    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const templateData = await req.json();
    
    // Validate required fields
    if (!templateData.name || !templateData.template || !templateData.category) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, template, category'
      }, { status: 400 });
    }

    const template = await dynamicPromptManager.createTemplate(templateData);
    
    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error creating prompt template:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Template ID is required'
      }, { status: 400 });
    }

    const updateData = await req.json();
    const template = await dynamicPromptManager.updateTemplate(id, updateData);
    
    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error updating prompt template:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Template ID is required'
      }, { status: 400 });
    }

    await dynamicPromptManager.deleteTemplate(id);
    
    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prompt template:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
