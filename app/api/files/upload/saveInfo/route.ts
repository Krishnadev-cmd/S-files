
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/server/db";
import type { PresignedUrlProp, FileInDBProp } from "@/app/utils/types";

export async function POST(request: NextRequest) {
  try {
    const { presignedUrls, bucketName } = await request.json() as { presignedUrls: PresignedUrlProp[], bucketName: string };
    console.log("Received presigned URLs for database save:", presignedUrls);
    console.log("Target bucket:", bucketName);

    if (!presignedUrls?.length) {
      return NextResponse.json(
        { message: "No files to save" },
        { status: 400 }
      );
    }

    if (!bucketName) {
      return NextResponse.json(
        { message: "Bucket name is required" },
        { status: 400 }
      );
    }

    // Save files info to database
    const saveFilesInfo = await db.file.createMany({
      data: presignedUrls.map((file: PresignedUrlProp) => ({
        bucket: bucketName,
        fileName: file.fileNameInBucket,
        originalName: file.originalFileName,
        size: file.fileSize,
      })),
    });

    console.log("Database save result:", saveFilesInfo);

    if (saveFilesInfo) {
      return NextResponse.json({ message: "Files saved successfully" });
    } else {
      return NextResponse.json(
        { message: "Failed to save files" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error saving file info to database:", error);
    return NextResponse.json(
      { message: "Failed to save file info to database" },
      { status: 500 }
    );
  }
}
