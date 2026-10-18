import { useState, useRef } from "react";
import {
  validateFiles,
  MAX_FILE_SIZE_S3_ENDPOINT,
  handleUpload,
  getPresignedUrls,
} from "@/app/utils/fileUploadHelpers";
import { UploadFilesFormUI } from "./UploadFilesFormUI";
import { type ShortFileProp } from "@/app/utils/types";
import { useBucket } from "@/contexts/bucket-context";

type UploadFilesFormProps = {
  onUploadSuccess: () => void;
};

export function UploadFilesS3PresignedUrl({
  onUploadSuccess,
}: UploadFilesFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentBucket } = useBucket();

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const added = Array.from(newFiles);
    setSelectedFiles((prev) => [...prev, ...added]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadToServer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const filesToUpload = selectedFiles.length > 0
      ? selectedFiles
      : fileInputRef.current?.files
      ? Array.from(fileInputRef.current.files)
      : [];

    if (!filesToUpload.length) {
      alert("Please select at least one file to upload");
      return;
    }

    const filesInfo: ShortFileProp[] = filesToUpload.map((file) => ({
      originalFileName: file.name,
      fileSize: file.size,
    }));

    const filesValidationResult = validateFiles(
      filesInfo,
      MAX_FILE_SIZE_S3_ENDPOINT,
    );
    if (filesValidationResult) {
      alert(filesValidationResult);
      return;
    }

    setIsLoading(true);

    try {
      const presignedUrls = await getPresignedUrls(filesInfo, currentBucket!);
      if (!presignedUrls?.length) {
        alert("Could not generate presigned upload URLs. Please check bucket configuration.");
        setIsLoading(false);
        return;
      }

      await handleUpload(filesToUpload, presignedUrls, () => {
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onUploadSuccess();
      }, currentBucket!);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please check CORS configuration or network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UploadFilesFormUI
      isLoading={isLoading}
      fileInputRef={fileInputRef}
      uploadToServer={uploadToServer}
      maxFileSize={MAX_FILE_SIZE_S3_ENDPOINT}
      selectedFiles={selectedFiles}
      onFilesSelected={handleFileChange}
      onRemoveFile={removeFile}
    />
  );
}