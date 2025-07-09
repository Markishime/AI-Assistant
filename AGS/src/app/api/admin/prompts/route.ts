import { NextRequest, NextResponse } from 'next/server';
import { supabaseManager } from '@/lib/supabase-manager';

export async function GET() {
  try {
    const prompts = await supabaseManager.getPrompts();
    
    return NextResponse.json({
      success: true,
      prompts
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
    const { title, description, template, sample_type, language, user_focus, is_active } = await req.json();
    
    if (!title || !template || !sample_type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, template, sample_type'
      }, { status: 400 });
    }

    const prompt = await supabaseManager.createPrompt({
      title,
      description,
      template,
      sample_type,
      language: language || 'en',
      user_focus,
      is_active: is_active !== undefined ? is_active : true
    });
    
    return NextResponse.json({
      success: true,
      prompt
    });
  } catch (error) {
    console.error('Error creating prompt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: errorMessage
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
        error: 'Prompt ID is required'
      }, { status: 400 });
    }

    const updateData = await req.json();
    
    const prompt = await supabaseManager.updatePrompt(id, updateData);
    
    return NextResponse.json({
      success: true,
      prompt
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
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
        error: 'Prompt ID is required'
      }, { status: 400 });
    }

    await supabaseManager.deletePrompt(id);
    
    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
