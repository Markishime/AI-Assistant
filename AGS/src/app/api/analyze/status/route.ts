import { NextResponse } from 'next/server';

export async function GET() {
  const status = {
    openAIConfigured: !!(process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY),
    supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    analysisSystemReady: false,
    missingConfiguration: [] as string[]
  };

  if (!status.openAIConfigured) {
    status.missingConfiguration.push('OPENAI_API_KEY is required for AI analysis');
  }

  if (!status.supabaseConfigured) {
    status.missingConfiguration.push('Supabase configuration is required');
  }

  status.analysisSystemReady = status.openAIConfigured && status.supabaseConfigured;

  return NextResponse.json(status);
} 