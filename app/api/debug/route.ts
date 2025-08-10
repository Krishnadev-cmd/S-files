import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development/debug mode
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Debug endpoint disabled in production' }, { status: 403 });
  }

  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? 'SET' : 'NOT SET',
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  });
}
