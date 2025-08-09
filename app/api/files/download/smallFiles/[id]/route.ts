import { getFileFromBucket } from "@/app/utils/s3-file-management";
import { db } from "@/app/server/db";
import dotenv from "dotenv";

dotenv.config();

const env = process.env;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("📥 Downloading file directly with ID:", id);
  
  try {
    if (!id || typeof id !== "string") {
      console.error("❌ Missing or invalid id:", id);
      return Response.json({ message: "Invalid request" }, { status: 400 });
    }

    // Get the file name and original name from the database
    const fileObject = await db.file.findUnique({
      where: { id },
      select: {
        fileName: true,
        originalName: true,
      },
    });

    if (!fileObject) {
      console.error("❌ File not found in database:", id);
      return Response.json({ message: "File not found" }, { status: 404 });
    }

    console.log("📁 Found file to download:", fileObject.fileName);

    // Get the file from the bucket
    const fileStream = await getFileFromBucket({
      bucketName: env.S3_BUCKET_NAME!,
      fileName: fileObject.fileName,
    });

    if (!fileStream) {
      console.error("❌ File not found in storage:", fileObject.fileName);
      return Response.json({ message: "File not found in storage" }, { status: 404 });
    }

    console.log("✅ File stream retrieved successfully");

    // Convert the Node.js stream to a buffer for the Response
    const chunks: Buffer[] = [];
    
    return new Promise<Response>((resolve, reject) => {
      fileStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      fileStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log("✅ File downloaded successfully");
        
        // Return the file as a download
        resolve(new Response(buffer, {
          headers: {
            'Content-Disposition': `attachment; filename="${fileObject.originalName}"`,
            'Content-Type': 'application/octet-stream',
          },
        }));
      });
      
      fileStream.on('error', (error) => {
        console.error("❌ Stream error:", error);
        reject(Response.json({ 
          message: "Error reading file", 
          error: error.message 
        }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error("❌ Error downloading file:", error);
    return Response.json({ 
      message: "Internal server error", 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
