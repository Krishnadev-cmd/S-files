import { NextRequest, NextResponse } from "next/server";
import { checkStorageConnection } from "@/app/utils/s3-client-config";
import { createBucketIfNotExists } from "@/app/utils/s3-file-management";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucketName = searchParams.get('bucket');

    console.log("🔍 Debug endpoint called");
    console.log("Environment variables:");
    console.log("- AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "✅ Set" : "❌ Missing");
    console.log("- AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "✅ Set" : "❌ Missing");
    console.log("- S3_ENDPOINT:", process.env.S3_ENDPOINT || "❌ Missing");
    console.log("- AWS_REGION:", process.env.AWS_REGION || "auto");

    // Check storage connection
    const connectionStatus = await checkStorageConnection();
    console.log("Storage connection:", connectionStatus ? "✅ Connected" : "❌ Failed");

    if (bucketName) {
      try {
        await createBucketIfNotExists(bucketName);
        console.log(`✅ Bucket ${bucketName} is ready`);
      } catch (error) {
        console.error(`❌ Bucket ${bucketName} setup failed:`, error);
        return NextResponse.json({
          status: "error",
          message: `Bucket setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          bucketName,
          connectionStatus,
        });
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Debug information retrieved successfully",
      environment: {
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.AWS_REGION || "auto",
      },
      connectionStatus,
      bucketName: bucketName || "not provided",
    });

  } catch (error) {
    console.error("❌ Debug endpoint error:", error);
    return NextResponse.json({
      status: "error",
      message: `Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }, { status: 500 });
  }
}
