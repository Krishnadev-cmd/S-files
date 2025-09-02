import * as Minio from "minio";
import { S3Client, HeadBucketCommand, CreateBucketCommand, HeadObjectCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, PutBucketCorsCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
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

// Function to set up CORS for R2 bucket
export async function setupR2BucketCors(bucketName: string) {
  if (!useR2) {
    console.log("📝 Skipping CORS setup for MinIO (not needed)");
    return;
  }

  try {
    console.log(`🔧 Setting up CORS for R2 bucket: ${bucketName}`);
    
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          AllowedOrigins: [
            "http://localhost:3000",
            "https://localhost:3000",
            ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
            ...(process.env.NODE_ENV === 'development' ? ["*"] : []),
          ],
          ExposeHeaders: ["ETag", "x-amz-version-id"],
          MaxAgeSeconds: 3000,
        },
      ],
    };

    await r2Client!.send(new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration,
    }));
    
    console.log(`✅ CORS policy configured for R2 bucket: ${bucketName}`);
  } catch (error) {
    console.error(`❌ Failed to set CORS for bucket ${bucketName}:`, error);
    // Don't throw here - CORS failure shouldn't prevent bucket creation
    console.warn(`⚠️ Bucket created but CORS setup failed. You may need to configure CORS manually.`);
  }
}

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

export async function createBucketIfNotExists(bucketName: string): Promise<{ success: boolean; message: string; corsConfigured?: boolean; error?: string }> {
  try {
    if (useR2) {
      console.log(`🌐 Creating/checking R2 bucket: ${bucketName}`);
      
      // Validate bucket name format for R2
      if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(bucketName) || bucketName.length < 3 || bucketName.length > 63) {
        return {
          success: false,
          message: "Invalid bucket name format",
          error: "Invalid bucket name format for R2. Must be 3-63 characters, lowercase letters, numbers, and hyphens only."
        };
      }

      let corsConfigured = false;

      try {
        // First try to check if bucket exists
        await r2Client!.send(new HeadBucketCommand({ Bucket: bucketName }));
        console.log(`✅ R2 bucket ${bucketName} already exists`);
        return {
          success: true,
          message: `R2 bucket ${bucketName} already exists`,
          corsConfigured: false // We don't know if CORS is configured for existing buckets
        };
      } catch (headError: any) {
        if (headError.name === 'NotFound' || headError.name === 'NoSuchBucket') {
          // Bucket doesn't exist, try to create it
          console.log(`📦 Creating R2 bucket: ${bucketName}`);
          try {
            await r2Client!.send(new CreateBucketCommand({ 
              Bucket: bucketName 
            }));
            console.log(`✅ Created R2 bucket: ${bucketName}`);

            // Set up CORS configuration immediately after creating bucket
            try {
              await setupR2BucketCors(bucketName);
              corsConfigured = true;
            } catch (corsError) {
              console.warn(`⚠️ CORS setup failed for ${bucketName}:`, corsError);
            }
            
            return {
              success: true,
              message: `Successfully created R2 bucket ${bucketName}`,
              corsConfigured
            };
            
          } catch (createError: any) {
            if (createError.name === 'BucketAlreadyExists') {
              console.log(`✅ R2 bucket ${bucketName} was created by another process`);
              return {
                success: true,
                message: `R2 bucket ${bucketName} created by another process`,
                corsConfigured: false
              };
            } else {
              console.error(`❌ Failed to create R2 bucket:`, createError);
              return {
                success: false,
                message: "Failed to create R2 bucket",
                error: `Failed to create R2 bucket "${bucketName}": ${createError.message}`
              };
            }
          }
        } else {
          // Some other error occurred while checking bucket
          console.error(`❌ Error checking R2 bucket:`, headError);
          return {
            success: false,
            message: "Error checking R2 bucket",
            error: `Error accessing R2 bucket "${bucketName}": ${headError.message}`
          };
        }
      }
    } else {
      // For MinIO, create bucket if it doesn't exist
      const bucketExists = await s3Client.bucketExists(bucketName);
      if (!bucketExists) {
        await s3Client.makeBucket(bucketName);
        console.log(`✅ Created MinIO bucket: ${bucketName}`);
        return {
          success: true,
          message: `Successfully created MinIO bucket ${bucketName}`,
          corsConfigured: false
        };
      } else {
        console.log(`✅ MinIO bucket ${bucketName} already exists`);
        return {
          success: true,
          message: `MinIO bucket ${bucketName} already exists`,
          corsConfigured: false
        };
      }
    }
  } catch (error: any) {
    console.error("❌ Error with bucket:", error);
    return {
      success: false,
      message: "Error with bucket creation",
      error: error.message || "Unknown error"
    };
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
  try {
    console.log(`🔧 Creating presigned upload URL for bucket: ${bucketName}, file: ${fileName}`);
    
    // Create bucket if it doesn't exist
    await createBucketIfNotExists(bucketName);

    if (useR2) {
      console.log(`🌐 Using R2 with endpoint: ${process.env.S3_ENDPOINT}`);
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      });
      const url = await getSignedUrl(r2Client!, command, { expiresIn: expiry });
      console.log(`✅ R2 presigned URL created successfully`);
      return url;
    } else {
      console.log(`🏠 Using MinIO for local development`);
      const url = await s3Client.presignedPutObject(bucketName, fileName, expiry);
      console.log(`✅ MinIO presigned URL created successfully`);
      return url;
    }
  } catch (error) {
    console.error(`❌ Failed to create presigned upload URL:`, error);
    throw error;
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