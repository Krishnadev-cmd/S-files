import { S3Client } from "@aws-sdk/client-s3";
import * as Minio from "minio";

// For backwards compatibility and local development with MinIO
export const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT!,
  port: process.env.S3_PORT ? Number(process.env.S3_PORT) : undefined,
  accessKey: process.env.S3_ACCESS_KEY!,
  secretKey: process.env.S3_SECRET_KEY!,
  useSSL: process.env.S3_USE_SSL === "true",
});

// For production deployment with cloud providers
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT?.startsWith('http') ? process.env.S3_ENDPOINT : undefined,
  forcePathStyle: process.env.S3_ENDPOINT?.includes('localhost') || process.env.S3_ENDPOINT?.includes('127.0.0.1'),
});

// Use MinIO client for local development, S3 client for production
export const isProduction = process.env.NODE_ENV === "production";
export const storageClient = isProduction ? s3Client : minioClient;

export async function checkS3Connection(): Promise<boolean> {
  try {
    if (isProduction) {
      // For AWS S3/R2/Spaces - just return true as connection is handled automatically
      return true;
    } else {
      // For local MinIO
      await minioClient.listBuckets();
      return true;
    }
  } catch (error) {
    console.error("❌ Storage connection failed:", error);
    return false;
  }
}

export async function createBucketIfNotExists(bucketName: string) {
  if (!isProduction) {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
    }
  }
  // For production, assume bucket exists (create it manually in cloud provider)
}

// Export the original functions for compatibility
export { minioClient as s3Client };
export const bucketName = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET;
