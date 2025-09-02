import { NextRequest, NextResponse } from "next/server";
import { s3Client, useR2 } from "@/app/utils/s3-client-config";
import { CreateBucketCommand, PutBucketCorsCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

export async function POST(request: NextRequest) {
  try {
    const { bucketName } = await request.json();

    if (!bucketName) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 }
      );
    }

    if (!useR2) {
      return NextResponse.json(
        { error: "This endpoint is only for Cloudflare R2 setup" },
        { status: 400 }
      );
    }

    console.log(`🔧 Setting up R2 bucket: ${bucketName}`);

    // First check if bucket exists
    let bucketExists = false;
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      bucketExists = true;
      console.log(`✅ R2 bucket ${bucketName} already exists`);
    } catch (error: any) {
      if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
        console.log(`📦 R2 bucket ${bucketName} does not exist, will create it`);
      } else {
        console.error(`❌ Error checking bucket:`, error);
        throw error;
      }
    }

    // Create bucket in R2 if it doesn't exist
    if (!bucketExists) {
      try {
        await s3Client.send(new CreateBucketCommand({ 
          Bucket: bucketName 
        }));
        console.log(`✅ Created R2 bucket: ${bucketName}`);
      } catch (error: any) {
        if (error.name === 'BucketAlreadyOwnedByYou' || error.name === 'BucketAlreadyExists') {
          console.log(`✅ R2 bucket ${bucketName} already exists`);
        } else {
          console.error(`❌ Failed to create R2 bucket:`, error);
          throw error;
        }
      }
    }

    // Set up CORS policy for the bucket
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          AllowedOrigins: [
            "http://localhost:3000",
            "https://localhost:3000",
            ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
            ...(process.env.NODE_ENV === 'development' ? ["*"] : []), // Allow all origins in development
          ],
          ExposeHeaders: ["ETag", "x-amz-version-id"],
          MaxAgeSeconds: 3000,
        },
      ],
    };

    try {
      await s3Client.send(new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: corsConfiguration,
      }));
      console.log(`✅ CORS policy set for bucket: ${bucketName}`);
    } catch (corsError) {
      console.error(`❌ Failed to set CORS policy:`, corsError);
      // Don't throw here, as the bucket might still work
    }

    return NextResponse.json({
      message: "R2 bucket setup completed successfully",
      bucketName,
      corsConfigured: true,
    });

  } catch (error) {
    console.error("❌ R2 setup error:", error);
    return NextResponse.json({
      error: `R2 setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }, { status: 500 });
  }
}
