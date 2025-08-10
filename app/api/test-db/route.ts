import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/server/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection by counting files
    const fileCount = await db.file.count();
    
    // Also test if we can query files
    const files = await db.file.findMany({
      take: 1,
      select: {
        id: true,
        originalName: true,
      },
    });

    return NextResponse.json({
      status: 'Database connection working',
      fileCount,
      sampleFile: files[0] || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
