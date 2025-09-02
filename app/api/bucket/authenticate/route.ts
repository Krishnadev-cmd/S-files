import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/server/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { bucketName, password } = await request.json();

    if (!bucketName || !password) {
      return NextResponse.json(
        { error: "Bucket name and password are required" },
        { status: 400 }
      );
    }

    // Find the bucket in the database
    const bucket = await db.bucket.findUnique({
      where: { name: bucketName },
    });

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket not found" },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, bucket.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      message: "Authentication successful",
      bucketName: bucket.name 
    });

  } catch (error) {
    console.error("Error authenticating bucket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
