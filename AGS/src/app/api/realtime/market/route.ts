import { NextResponse } from 'next/server';

export async function GET() {
  // In production, fetch from a real commodity API. Here, mock data:
  const price = 3850 + Math.floor(Math.random() * 100 - 50); // MYR/tonne
  const trend = Math.random() > 0.5 ? 'up' : 'down';
  const lastUpdated = new Date().toISOString();
  return NextResponse.json({
    price,
    currency: 'MYR',
    unit: 'tonne',
    trend,
    lastUpdated
  });
} 