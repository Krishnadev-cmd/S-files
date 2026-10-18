import { S3Client, CreateBucketCommand, HeadBucketCommand, PutBucketCorsCommand, ListBucketsCommand } from "@aws-sdk/client-s3";

// R2 client specifically for bucket management — lazy-initialized to avoid crashes in local dev
let _r2ManagementClient: S3Client | null = null;

function getR2ManagementClient(): S3Client {
  if (!_r2ManagementClient) {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error("R2 credentials are not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.");
    }
    _r2ManagementClient = new S3Client({
      region: process.env.AWS_REGION || "auto",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: false,
    });
  }
  return _r2ManagementClient;
}

export interface BucketCreationResult {
  success: boolean;
  bucketName: string;
  message: string;
  corsConfigured: boolean;
  error?: string;
}

export async function createR2BucketWithCors(bucketName: string): Promise<BucketCreationResult> {
  const result: BucketCreationResult = {
    success: false,
    bucketName,
    message: '',
    corsConfigured: false,
  };

  try {
    // Validate bucket name
    if (!isValidR2BucketName(bucketName)) {
      result.error = "Invalid bucket name. Must be 3-63 characters, lowercase letters, numbers, and hyphens only, and start/end with letter or number.";
      return result;
    }

    console.log(`🔧 Setting up R2 bucket: ${bucketName}`);

    // Step 1: Check if bucket already exists
    let bucketExists = false;
    try {
      await getR2ManagementClient().send(new HeadBucketCommand({ Bucket: bucketName }));
      bucketExists = true;
      console.log(`✅ R2 bucket ${bucketName} already exists`);
      result.message = `Bucket ${bucketName} already exists`;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.name === 'NoSuchBucket' || error.$metadata?.httpStatusCode === 404) {
        console.log(`📦 R2 bucket ${bucketName} does not exist, will create it`);
      } else if (error.name === 'Forbidden' || error.name === 'AccessDenied' || error.$metadata?.httpStatusCode === 403) {
        result.error = `Access denied. Please check your R2 API token permissions. Ensure it has 'Object:Write' and 'Bucket:Write' permissions.`;
        return result;
      } else {
        console.error(`❌ Error checking bucket:`, error);
        result.error = `Error checking bucket: ${error.message}`;
        return result;
      }
    }

    // Step 2: Create bucket if it doesn't exist
    if (!bucketExists) {
      try {
        console.log(`🔨 Creating R2 bucket: ${bucketName}`);
        const createResult = await getR2ManagementClient().send(new CreateBucketCommand({ 
          Bucket: bucketName 
        }));
        console.log(`✅ Created R2 bucket: ${bucketName}`, createResult);
        result.message = `Successfully created bucket ${bucketName}`;
      } catch (createError: any) {
        console.error(`❌ Failed to create R2 bucket:`, createError);
        
        if (createError.name === 'BucketAlreadyExists' || createError.name === 'BucketAlreadyOwnedByYou') {
          console.log(`✅ R2 bucket ${bucketName} already exists (created concurrently)`);
          result.message = `Bucket ${bucketName} already exists`;
        } else if (createError.name === 'TooManyBuckets') {
          result.error = "You have reached the maximum number of buckets allowed in your R2 account.";
          return result;
        } else if (createError.$metadata?.httpStatusCode === 400) {
          result.error = `Invalid bucket configuration: ${createError.message}`;
          return result;
        } else {
          result.error = `Failed to create bucket: ${createError.message || 'Unknown error'}`;
          return result;
        }
      }
    }

    // Step 3: Set up CORS configuration
    const corsResult = await configureR2BucketCors(bucketName);
    result.corsConfigured = corsResult.success;
    if (corsResult.success) {
      result.message += " with CORS configured";
    } else {
      result.message += " (Warning: CORS configuration failed - configure in R2 dashboard or set CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN)";
    }

    result.success = true;
    return result;

  } catch (error: any) {
    console.error("❌ R2 bucket creation process failed:", error);
    result.error = error.message || "Unknown error occurred";
    return result;
  }
}

export function isValidR2BucketName(bucketName: string): boolean {
  // R2 bucket naming rules (same as S3):
  // - 3-63 characters
  // - Lowercase letters, numbers, hyphens, and periods
  // - Must start and end with letter or number
  // - Cannot contain consecutive periods or period-hyphen combinations
  // - Cannot be formatted as IP address
  
  if (!bucketName || bucketName.length < 3 || bucketName.length > 63) {
    return false;
  }
  
  // Must be lowercase letters, numbers, hyphens, and periods only
  if (!/^[a-z0-9.-]+$/.test(bucketName)) {
    return false;
  }
  
  // Must start and end with letter or number
  if (!/^[a-z0-9].*[a-z0-9]$/.test(bucketName)) {
    return false;
  }
  
  // Cannot contain consecutive periods, consecutive hyphens, or period-hyphen combinations
  if (/\.\.|\.\-|\-\.|\-\-/.test(bucketName)) {
    return false;
  }
  
  // Cannot be formatted as IP address
  if (/^\d+\.\d+\.\d+\.\d+$/.test(bucketName)) {
    return false;
  }
  
  return true;
}

export async function listR2Buckets(): Promise<string[]> {
  try {
    const response = await getR2ManagementClient().send(new ListBucketsCommand({}));
    return response.Buckets?.map(bucket => bucket.Name || '') || [];
  } catch (error) {
    console.error("❌ Error listing R2 buckets:", error);
    return [];
  }
}

export async function verifyR2BucketAccess(bucketName: string): Promise<{ accessible: boolean; error?: string }> {
  try {
    await getR2ManagementClient().send(new HeadBucketCommand({ Bucket: bucketName }));
    return { accessible: true };
  } catch (error: any) {
    console.error(`❌ Cannot access R2 bucket ${bucketName}:`, error);
    return { 
      accessible: false, 
      error: error.name === 'NotFound' ? 'Bucket does not exist' : error.message 
    };
  }
}

export async function configureR2BucketCors(bucketName: string): Promise<{ success: boolean; error?: string }> {
  console.log(`🌐 Configuring CORS for R2 bucket: ${bucketName}`);

  // Approach 1: Cloudflare REST API (Official & most reliable if account ID + API token are provided)
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && apiToken) {
    try {
      console.log(`⚡ Configuring CORS via Cloudflare REST API for bucket: ${bucketName}`);
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/cors`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rules: [
              {
                allowed: {
                  origins: ["*"],
                  methods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
                  headers: ["*"],
                },
                exposeHeaders: ["ETag", "x-amz-request-id", "x-amz-version-id"],
                maxAgeSeconds: 3600,
              },
            ],
          }),
        }
      );

      const data = await response.json().catch(() => null);
      if (response.ok && data?.success !== false) {
        console.log(`✅ CORS successfully configured via Cloudflare REST API for ${bucketName}`);
        return { success: true };
      } else {
        console.warn(`⚠️ Cloudflare REST API returned warning/error for ${bucketName}:`, data?.errors || response.statusText);
      }
    } catch (cfError) {
      console.warn(`⚠️ Cloudflare API call failed for ${bucketName}:`, cfError);
    }
  }

  // Approach 2: S3-compatible PutBucketCorsCommand via AWS SDK
  try {
    console.log(`⚡ Configuring CORS via S3 PutBucketCorsCommand for bucket: ${bucketName}`);
    const corsConfiguration = {
      CORSRules: [
        {
          ID: "AllowWebAccess",
          AllowedHeaders: [
            "*",
            "Authorization", 
            "Content-Type", 
            "x-amz-date", 
            "x-amz-content-sha256",
            "x-amz-security-token"
          ],
          AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          AllowedOrigins: ["*"],
          ExposeHeaders: [
            "ETag", 
            "x-amz-version-id", 
            "x-amz-request-id",
            "x-amz-delete-marker"
          ],
          MaxAgeSeconds: 3600,
        },
      ],
    };

    await getR2ManagementClient().send(new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration,
    }));
    
    console.log(`✅ CORS policy configured via S3 API for R2 bucket: ${bucketName}`);
    return { success: true };
  } catch (s3Error: any) {
    console.error(`❌ Failed to set CORS via S3 API for bucket ${bucketName}:`, s3Error);
    return { success: false, error: s3Error?.message || "Failed to configure CORS" };
  }
}

