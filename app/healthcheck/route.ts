import { checkMinioConnection } from "@/app/utils/s3-file-management";
import { NextResponse } from "next/server";

export async function GET() {
  const isConnected = await checkMinioConnection();

  if (!isConnected) {
    return NextResponse.json({ status: "error", message: "MinIO not connected" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok", message: "MinIO is connected" });
}