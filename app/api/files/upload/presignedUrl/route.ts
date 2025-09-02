import { NextRequest, NextResponse } from "next/server";
import type { ShortFileProp, PresignedUrlProp } from "@/app/utils/types";
import { createPresignedUrlToUpload } from "@/app/utils/s3-file-management";
import { nanoid } from "nanoid";

const expiry = 60 * 60; // 1 hour

export async function POST(request: NextRequest) {
  try {
    // get the files and bucket from the request body
    const { files, bucketName } = await request.json() as { files: ShortFileProp[], bucketName: string };
    console.log("Received files for presigned URLs:", files);
    console.log("Target bucket:", bucketName);

    if (!files?.length) {
      return NextResponse.json(
        { message: "No files to upload" },
        { status: 400 }
      );
    }

    if (!bucketName) {
      return NextResponse.json(
        { message: "Bucket name is required" },
        { status: 400 }
      );
    }

    const presignedUrls = [] as PresignedUrlProp[];

    if (files?.length) {
      // use Promise.all to get all the presigned urls in parallel
      await Promise.all(
        // loop through the files
        files.map(async (file) => {
          const fileName = `${nanoid(5)}-${file?.originalFileName}`;

          // get presigned url using s3 sdk
          const url = await createPresignedUrlToUpload({
            bucketName,
            fileName,
            expiry,
          });
          // add presigned url to the list
          presignedUrls.push({
            fileNameInBucket: fileName,
            originalFileName: file.originalFileName,
            fileSize: file.fileSize,
            url,
          });
        }),
      );
    }

    console.log("Generated presigned URLs:", presignedUrls.length);
    return NextResponse.json(presignedUrls);
  } catch (error) {
    console.error("Error creating presigned URLs:", error);
    return NextResponse.json(
      { message: "Failed to create presigned URLs" },
      { status: 500 }
    );
  }
}