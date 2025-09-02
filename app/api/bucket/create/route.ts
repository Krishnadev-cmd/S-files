import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/server/db";
import bcrypt from "bcryptjs";
import { createR2BucketWithCors, isValidR2BucketName } from "@/app/utils/r2-bucket-manager";
import { createBucketIfNotExists } from "@/app/utils/s3-file-management";

// Check if we're using R2 (production) or MinIO (development)
const useR2 = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.S3_ENDPOINT);

export async function POST(request: NextRequest) {
  try {
    const { bucketName, password } = await request.json();

    if (!bucketName || !password) {
      return NextResponse.json(
        { error: "Bucket name and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Validate bucket name format
    if (!isValidR2BucketName(bucketName)) {
      return NextResponse.json(
        { error: "Invalid bucket name. Must be 3-63 characters, lowercase letters, numbers, and hyphens only, and start/end with letter or number." },
        { status: 400 }
      );
    }

    // Check if bucket name already exists in database
    const existingBucket = await db.bucket.findUnique({
      where: { name: bucketName },
    });

    if (existingBucket) {
      return NextResponse.json(
        { error: "Bucket name already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the actual bucket in storage
    let storageResult;
    
    try {
      if (useR2) {
        console.log(`🔧 Creating R2 bucket with automatic CORS: ${bucketName}`);
        storageResult = await createR2BucketWithCors(bucketName);
      } else {
        console.log(`🔧 Creating MinIO bucket: ${bucketName}`);
        storageResult = await createBucketIfNotExists(bucketName);
      }
      
      if (!storageResult.success) {
        console.error("Storage bucket creation failed:", storageResult.error);
        return NextResponse.json(
          { 
            error: "Failed to create storage bucket", 
            details: storageResult.error || storageResult.message,
            suggestion: useR2 
              ? "Please check your R2 API token permissions. Ensure it has 'Object:Write' and 'Bucket:Write' permissions."
              : "Please check your MinIO configuration."
          },
          { status: 500 }
        );
      }
      
      console.log(`✅ Storage bucket ready: ${bucketName} - ${storageResult.message}`);
      
    } catch (storageError) {
      console.error("Storage bucket creation failed:", storageError);
      
      const errorMessage = storageError instanceof Error ? storageError.message : "Unknown storage error";
      return NextResponse.json(
        { 
          error: "Failed to create storage bucket", 
          details: errorMessage,
          suggestion: useR2 
            ? "Please check your R2 credentials and permissions, or try creating the bucket manually in the Cloudflare dashboard."
            : "Please check your MinIO configuration."
        },
        { status: 500 }
      );
    }

    // Create the bucket record in database only after storage creation succeeds
    const bucket = await db.bucket.create({
      data: {
        name: bucketName,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bucket created successfully",
      bucket: {
        id: bucket.id,
        name: bucket.name,
        createdAt: bucket.createdAt,
      },
      storage: {
        message: storageResult.message,
        corsConfigured: storageResult.corsConfigured || false,
        provider: useR2 ? "Cloudflare R2" : "MinIO"
      }
    });

  } catch (error: any) {
    console.error("Error creating bucket:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
