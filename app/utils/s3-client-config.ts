import { S3Client } from "@aws-sdk/client-s3";
import * as Minio from "minio";

// Environment detection
export const isProduction = process.env.NODE_ENV === "production";
export const isR2Configured = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

// For backwards compatibility and local development with MinIO
export const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT_LOCAL || "localhost",
  port: process.env.S3_PORT ? Number(process.env.S3_PORT) : 9000,
  accessKey: process.env.S3_ACCESS_KEY || "minioadmin",
  secretKey: process.env.S3_SECRET_KEY || "minioadmin123",
  useSSL: process.env.S3_USE_SSL === "true",
});

// For production deployment with Cloudflare R2 or other cloud providers
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: false, // R2 supports virtual-hosted-style requests
});

// Use R2 if configured, otherwise fall back to MinIO for development
export const useR2 = isR2Configured;
export const storageClient = useR2 ? s3Client : minioClient;

export async function checkStorageConnection(): Promise<boolean> {
  try {
    if (useR2) {
      // For Cloudflare R2 - connection is handled automatically
      console.log("✅ Using Cloudflare R2 storage");
      return true;
    } else {
      // For local MinIO
      await minioClient.listBuckets();
      console.log("✅ MinIO connection successful");
      return true;
    }
  } catch (error) {
    console.error("❌ Storage connection failed:", error);
    return false;
  }
}

export async function createBucketIfNotExists(bucketName: string) {
  if (!useR2) {
    // Only for local MinIO - create bucket if it doesn't exist
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
      console.log(`✅ Created MinIO bucket: ${bucketName}`);
    }
  }
  // For R2, assume bucket exists (create it manually in Cloudflare dashboard)
}

// Export bucket name based on configuration
export const bucketName = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME || "sfile";

// Export the appropriate client based on configuration
export const activeStorageClient = useR2 ? s3Client : minioClient;
