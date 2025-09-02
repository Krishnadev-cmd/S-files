# Cloudflare R2 CORS Configuration

## Problem
The "Failed to fetch" error when uploading files to Cloudflare R2 is typically caused by CORS (Cross-Origin Resource Sharing) policy restrictions.

## Solution
You need to configure CORS policy for your R2 bucket to allow browser uploads.

### Step 1: Access Cloudflare Dashboard
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Find your bucket (e.g., the bucket name you created)

### Step 2: Configure CORS Policy
Click on your bucket, then go to Settings > CORS Policy and add this configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://yourdomain.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

### Step 3: Update for Production
When deploying to production, replace `"http://localhost:3000"` with your actual domain.

### Step 4: Alternative - Manual Bucket Creation
If automatic bucket creation fails, manually create buckets in the Cloudflare R2 dashboard:

1. Go to R2 Object Storage
2. Click "Create bucket"
3. Enter bucket name (same as what students will use)
4. Apply the CORS policy above
5. Save

## Environment Variables
Make sure these are set correctly:
- `AWS_ACCESS_KEY_ID`: Your R2 access key
- `AWS_SECRET_ACCESS_KEY`: Your R2 secret key  
- `S3_ENDPOINT`: Your R2 endpoint (e.g., `https://abc123.r2.cloudflarestorage.com`)
- `AWS_REGION`: Set to `auto` for R2

## Testing
Use the debug endpoint: `/api/bucket/debug?bucket=test-bucket` to check configuration.
