import { NextRequest, NextResponse } from "next/server";
import type { FileProps } from "@/app/utils/types";
import { db } from "@/app/server/db";

const LIMIT_FILES = 10;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket');

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 }
      );
    }

    // Get 10 latest files from the specified bucket
    const files = await db.file.findMany({
      where: {
        bucket: bucket,
      },
      take: LIMIT_FILES,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        originalName: true,
        size: true,
        createdAt: true,
      },
    });
    
    // The database type is a bit different from the frontend type
    // Make the array of files compatible with the frontend type FileProps
    const filesWithProps: FileProps[] = files.map((file) => ({
      id: file.id,
      originalFileName: file.originalName,
      fileSize: file.size,
      createdAt: file.createdAt,
    }));

    return NextResponse.json(filesWithProps);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}