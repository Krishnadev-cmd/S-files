
import type { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";

dotenv.config();

const env = process.env;
if (!env.S3_BUCKET_NAME) {
  throw new Error("S3_BUCKET_NAME is not defined in environment variables");
}
import { db } from "@/app/server/db";
import type { PresignedUrlProp, FileInDBProp } from "@/app/utils/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Only POST requests are allowed" });
    return;
  }

  const presignedUrls = req.body as PresignedUrlProp[];

  // Get the file name in bucket from the database
  const saveFilesInfo = await db.file.createMany({
    data: presignedUrls.map((file: FileInDBProp) => ({
      bucket: env.S3_BUCKET_NAME,
      fileName: file.fileNameInBucket,
      originalName: file.originalFileName,
      size: file.fileSize,
    })),
  });

  if (saveFilesInfo) {
    res.status(200).json({ message: "Files saved successfully" });
  } else {
    res.status(404).json({ message: "Files not found" });
  }
}
