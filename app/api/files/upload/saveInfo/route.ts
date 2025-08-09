
import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

const env = process.env;
if (!env.S3_BUCKET_NAME) {
  throw new Error("S3_BUCKET_NAME is not defined in environment variables");
}
import { db } from "@/app/server/db";
import type { PresignedUrlProp, FileInDBProp } from "@/app/utils/types";

export async function POST(request: NextRequest) {
  try {
    const presignedUrls = await request.json() as PresignedUrlProp[];
    console.log("Received presigned URLs for database save:", presignedUrls);

    if (!presignedUrls?.length) {
      return NextResponse.json(
        { message: "No files to save" },
        { status: 400 }
      );
    }

    // Save files info to database
    const saveFilesInfo = await db.file.createMany({
      data: presignedUrls.map((file: PresignedUrlProp) => ({
        bucket: env.S3_BUCKET_NAME!,
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
