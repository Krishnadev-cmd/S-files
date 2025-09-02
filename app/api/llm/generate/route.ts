import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getFileFromBucket } from "@/app/utils/s3-file-management";
import { db } from "@/app/server/db";
import dotenv from "dotenv";
import * as fs from 'fs';


dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export async function POST(request: NextRequest) {
  console.log("🤖 Processing LLM generation request...");
  
  try {
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

    // Get file data from S3 using the file's bucket
    const fileStream = await getFileFromBucket({
      bucketName: fileObject.bucket,
      fileName: fileObject.fileName,
    });

    if (!fileStream) {
      return Response.json({ error: "File not found in storage" }, { status: 404 });
    }

    const fileBuffer = await streamToBuffer(fileStream);

    const extension = fileObject.originalName.toLowerCase().split('.').pop();
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

    async function generate(question: string, fileBuffer: Buffer) {
        const contents = [
            { text: question },
            {
                inlineData: {
                    mimeType: mimeType,
                    data: fileBuffer.toString("base64"),
                }
            }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents
        });
        console.log(response.text);
        return response.text;
    }

    console.log("🚀 Sending request to Gemini...");

    const result = await generate(question, fileBuffer);
    const text = result

    console.log("✅ Received response from Gemini");

    return Response.json({ 
      response: text,
      fileName: fileObject.originalName 
    });

  } catch (error) {
    console.error("❌ Error in LLM generation:", error);
    return Response.json({ 
      error: "Failed to generate response", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
