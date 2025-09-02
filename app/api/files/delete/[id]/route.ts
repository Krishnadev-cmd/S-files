import { deleteFileFromBucket } from "@/app/utils/s3-file-management";
import { db } from "@/app/server/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("🗑️ Deleting file with ID:", id);
  
  try {
    if (!id || typeof id !== "string") {
      console.error("❌ Missing or invalid id:", id);
      return Response.json({ message: "Missing or invalid id" }, { status: 400 });
    }

    // Get the file name and bucket from the database
    const fileObject = await db.file.findUnique({
      where: { id },
      select: { fileName: true, bucket: true },
    });

    if (!fileObject) {
      console.error("❌ File not found in database:", id);
      return Response.json({ message: "File not found" }, { status: 404 });
    }

    console.log("📁 Found file to delete:", fileObject.fileName, "in bucket:", fileObject.bucket);

    // Delete the file from the appropriate bucket
    await deleteFileFromBucket({
      bucketName: fileObject.bucket,
      fileName: fileObject.fileName,
    });
    console.log("✅ File deleted from storage");

    // Delete the file record from the database
    const deletedItem = await db.file.delete({
      where: { id },
    });

    if (deletedItem) {
      console.log("✅ File deleted from database successfully");
      return Response.json({ message: "File deleted successfully" });
    } else {
      console.error("❌ Failed to delete from database");
      return Response.json({ message: "Failed to delete file" }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    return Response.json({ 
      message: "Internal server error", 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
