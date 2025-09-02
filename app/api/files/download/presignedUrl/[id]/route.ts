import { createPresignedUrlToDownload } from "@/app/utils/s3-file-management";
import { db } from "@/app/server/db";

/**
 * This route is used to get presigned url for downloading file from S3
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("📥 Getting presigned download URL for file ID:", id);
  
  try {
    if (!id || typeof id !== "string") {
      console.error("❌ Missing or invalid id:", id);
      return Response.json({ message: "Missing or invalid id" }, { status: 400 });
    }

    // Get the file name and bucket from the database
    const fileObject = await db.file.findUnique({
      where: { id },
      select: { fileName: true, bucket: true },
    });

    if (!fileObject) {
      console.error("❌ File not found in database:", id);
      return Response.json({ message: "File not found" }, { status: 404 });
    }

    console.log("📁 Found file to download:", fileObject.fileName, "in bucket:", fileObject.bucket);

    // Get presigned url from s3 storage
    const presignedUrl = await createPresignedUrlToDownload({
      bucketName: fileObject.bucket,
      fileName: fileObject.fileName,
    });

    console.log("✅ Presigned download URL generated successfully");
    return Response.json(presignedUrl);
    
  } catch (error) {
    console.error("❌ Error generating download URL:", error);
    return Response.json({ 
      message: "Internal server error", 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
