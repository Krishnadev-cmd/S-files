import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getFileFromBucket } from "@/app/utils/s3-file-management";
import { db } from "@/app/server/db";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }
  return new GoogleGenAI({ apiKey });
}

export async function POST(request: NextRequest) {
  console.log("🤖 Processing LLM generation request...");
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        {
          error: "AI service is not configured",
          details: "Set GEMINI_API_KEY in the Vercel project environment variables and redeploy.",
        },
        { status: 503 },
      );
    }

    const { fileId, question } = await request.json();

    if (!fileId || !question) {
      return Response.json({ error: "File ID and question are required" }, { status: 400 });
    }

    console.log("📝 Question:", question);
    console.log("📁 File ID:", fileId);

    // Get file info from database
    const fileObject = await db.file.findUnique({
      where: { id: fileId },
      select: {
        fileName: true,
        originalName: true,
        bucket: true,
      },
    });

    if (!fileObject) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    console.log("📄 Found file:", fileObject.originalName, "in bucket:", fileObject.bucket);

    // Get file data from S3/R2 using the file's bucket
    const fileBody = await getFileFromBucket({
      bucketName: fileObject.bucket,
      fileName: fileObject.fileName,
    });

    if (!fileBody) {
      return Response.json({ error: "File not found in storage" }, { status: 404 });
    }

    // AWS SDK v3 returns an SdkStream — use transformToByteArray() to get Uint8Array
    let fileBuffer: Buffer;
    if (typeof (fileBody as any).transformToByteArray === "function") {
      // R2 / S3 path: SdkStreamMixin
      const bytes = await (fileBody as any).transformToByteArray();
      fileBuffer = Buffer.from(bytes);
    } else {
      // MinIO path: Node.js Readable stream
      fileBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        const stream = fileBody as NodeJS.ReadableStream;
        stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
      });
    }

    const extension = fileObject.originalName.toLowerCase().split(".").pop();
    let mimeType = "application/octet-stream";
    
    if (extension === "pdf") {
      mimeType = "application/pdf";
    } else if (["jpg", "jpeg"].includes(extension || "")) {
      mimeType = "image/jpeg";
    } else if (extension === "png") {
      mimeType = "image/png";
    } else if (extension === "txt") {
      mimeType = "text/plain";
    }

    console.log("🔍 Detected MIME type:", mimeType);

    console.log("🚀 Sending request to Gemini...");

    const ai = getGeminiClient();

    // @google/genai v2 API: contents array with text + inlineData parts
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            { text: question },
            {
              inlineData: {
                mimeType,
                data: fileBuffer.toString("base64"),
              },
            },
          ],
        },
      ],
    });

    const text = response.text;
    console.log("✅ Received response from Gemini");

    return Response.json({
      response: text || "Gemini returned an empty response.",
      fileName: fileObject.originalName 
    });

  } catch (error) {
    console.error("❌ Error in LLM generation:", error);
    const details = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ 
      error: "Failed to generate response", 
      details,
    }, { status: 500 });
  }
}
