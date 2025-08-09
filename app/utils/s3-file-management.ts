import * as Minio from "minio";
import { S3Client, HeadBucketCommand, CreateBucketCommand, HeadObjectCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type internal from "stream";

// Check if we should use R2 (production) or MinIO (development)
const useR2 = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.S3_ENDPOINT);

let s3Client: any;
let r2Client: S3Client | null = null;

if (useR2) {
  // R2/S3 client for production
  r2Client = new S3Client({
    region: process.env.AWS_REGION || "auto",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: false,
  });
  s3Client = r2Client;
  console.log(`🔧 Using Cloudflare R2 storage: ${process.env.S3_ENDPOINT}`);
} else {
  // MinIO client for development
  s3Client = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || process.env.S3_ENDPOINT_LOCAL || "localhost",
    port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : (process.env.S3_PORT ? Number(process.env.S3_PORT) : 9000),
    accessKey: process.env.MINIO_ACCESS_KEY || process.env.S3_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || process.env.S3_SECRET_KEY || "minioadmin",
    useSSL: process.env.MINIO_USE_SSL === "true" || process.env.S3_USE_SSL === "true",
  });
  const endpoint = process.env.MINIO_ENDPOINT || process.env.S3_ENDPOINT_LOCAL || "localhost";
  const port = process.env.MINIO_PORT || process.env.S3_PORT || 9000;
  const accessKey = process.env.MINIO_ACCESS_KEY || process.env.S3_ACCESS_KEY || "minioadmin";
  console.log(`🔧 Using MinIO storage at ${endpoint}:${port} with access key: ${accessKey}`);
}

// Export the configured client
export { s3Client };

export async function checkMinioConnection(): Promise<boolean> {
  try {
    if (useR2) {
      console.log("✅ Using Cloudflare R2 storage");
      return true; // R2 connection is validated when used
    } else {
      await s3Client.listBuckets();
      console.log("✅ MinIO connection successful");
      return true;
    }
  } catch (error) {
    console.error("❌ Storage connection failed:", error);
    return false;
  }
}

export async function createBucketIfNotExists(bucketName: string) {
  try {
    if (useR2) {
      // For R2, try to check if bucket exists
      await r2Client!.send(new HeadBucketCommand({ Bucket: bucketName }));
    } else {
      // For MinIO, create bucket if it doesn't exist
      const bucketExists = await s3Client.bucketExists(bucketName);
      if (!bucketExists) {
        await s3Client.makeBucket(bucketName);
        console.log(`✅ Created bucket: ${bucketName}`);
      }
    }
  } catch (error: any) {
    if (useR2 && error.name === 'NotFound') {
      // Bucket doesn't exist in R2, but we can't create it programmatically
      console.warn(`⚠️ Bucket ${bucketName} doesn't exist in R2. Please create it manually in Cloudflare dashboard.`);
      throw new Error(`Bucket ${bucketName} doesn't exist. Please create it in your Cloudflare R2 dashboard.`);
    } else if (!useR2) {
      console.error("❌ Error checking/creating bucket:", error);
      throw error;
    }
  }
}

export async function saveFileInBucket({
  bucketName,
  fileName,
  file,
}: {
  bucketName: string;
  fileName: string;
  file: Buffer | internal.Readable;
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName);

  // check if file exists
  const fileExists = await checkFileExistsInBucket({
    bucketName,
    fileName,
  });

  if (fileExists) {
    throw new Error("File already exists");
  }

  // Upload file to storage
  if (useR2) {
    await r2Client!.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: file,
    }));
  } else {
    await s3Client.putObject(bucketName, fileName, file);
  }
}

export async function checkFileExistsInBucket({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
}) {
  try {
    if (useR2) {
      await r2Client!.send(new HeadObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      }));
    } else {
      await s3Client.statObject(bucketName, fileName);
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function getFileFromBucket({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
}) {
  try {
    if (useR2) {
      const response = await r2Client!.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      }));
      return response.Body;
    } else {
      await s3Client.statObject(bucketName, fileName);
      return await s3Client.getObject(bucketName, fileName);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteFileFromBucket({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
}) {
  try {
    if (useR2) {
      await r2Client!.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      }));
    } else {
      await s3Client.removeObject(bucketName, fileName);
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function createPresignedUrlToUpload({
  bucketName,
  fileName,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: string;
  fileName: string;
  expiry?: number;
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName);

  if (useR2) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });
    return await getSignedUrl(r2Client!, command, { expiresIn: expiry });
  } else {
    return await s3Client.presignedPutObject(bucketName, fileName, expiry);
  }
}

export async function createPresignedUrlToDownload({
  bucketName,
  fileName,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: string;
  fileName: string;
  expiry?: number;
}) {
  if (useR2) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });
    return await getSignedUrl(r2Client!, command, { expiresIn: expiry });
  } else {
    return await s3Client.presignedGetObject(bucketName, fileName, expiry);
  }
}