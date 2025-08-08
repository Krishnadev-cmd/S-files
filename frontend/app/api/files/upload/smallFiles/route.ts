import { saveFileInBucket } from "@/app/utils/s3-file-management";
import { nanoid } from "nanoid";
import { db } from "@/app/server/db";
import dotenv from "dotenv";

dotenv.config();

const env = process.env;
if (!env.S3_BUCKET_NAME) {
  throw new Error("S3_BUCKET_NAME is not defined in environment variables");
}

const bucketName = env.S3_BUCKET_NAME;

export async function POST(request: Request) {
  console.log("📤 Uploading files via smallFiles API route...");
  
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      console.error("❌ No files provided");
      return Response.json({ 
        status: "fail", 
        message: "No files provided" 
      }, { status: 400 });
    }

    console.log(`📁 Processing ${files.length} files...`);

    // Upload files to S3 bucket and save to database
    const results = await Promise.all(
      files.map(async (file) => {
        if (!file || file.size === 0) {
          throw new Error("Invalid file");
        }

        // Generate unique file name
        const fileName = `${nanoid(5)}-${file.name}`;
        console.log(`📝 Processing file: ${file.name} -> ${fileName}`);

        // Convert File to Buffer for S3 upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save file to S3 bucket
        await saveFileInBucket({
          bucketName,
          fileName,
          file: buffer,
        });
        console.log(`✅ File uploaded to S3: ${fileName}`);

        // Save file info to database
        const dbResult = await db.file.create({
          data: {
            bucket: bucketName,
            fileName,
            originalName: file.name,
            size: file.size,
          },
        });
        console.log(`✅ File saved to database: ${dbResult.id}`);

        return {
          fileName,
          originalName: file.name,
          size: file.size,
          id: dbResult.id,
        };
      })
    );

    console.log(`✅ Successfully processed ${results.length} files`);
    return Response.json({ 
      status: "ok", 
      message: "Files were uploaded successfully",
      files: results 
    });

  } catch (error) {
    console.error("❌ Error uploading files:", error);
    return Response.json({ 
      status: "fail", 
      message: "Upload error",
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}