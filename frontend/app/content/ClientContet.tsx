// app/ClientContent.tsx
"use client";

import { useState, useEffect } from "react";
import { UploadFilesS3PresignedUrl } from "@/app/components/UploadFilesForm/UploadFilesS3PresignedUrl";
import { FilesContainer } from "@/app/components/FileContainer";
import { UploadFilesRoute } from "@/app/components/UploadFilesForm/UploadFilesRoute";
import { type FileProps } from "@/app/utils/types";

// Define the type for file upload mode
export type fileUploadMode = "s3PresignedUrl" | "NextjsAPIEndpoint";

// Type definition for the ModeSwitchMenu component's props
export type ModeSwitchMenuProps = {
  uploadMode: fileUploadMode;
  handleModeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

// Component for switching between file upload modes
function ModeSwitchMenu({ uploadMode, handleModeChange }: ModeSwitchMenuProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <label htmlFor="uploadMode" className="text-sm font-semibold text-gray-700">
            Upload Mode:
          </label>
        </div>
        
        <div className="relative">
          <select
            className="appearance-none bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
            id="uploadMode"
            value={uploadMode}
            onChange={handleModeChange}
          >
            <option value="s3PresignedUrl">🚀 S3 Presigned URL</option>
            <option value="NextjsAPIEndpoint">⚡ Next.js API Endpoint</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          {uploadMode === "s3PresignedUrl" ? "Direct S3 Upload" : "Server-side Processing"}
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-600">
          {uploadMode === "s3PresignedUrl" 
            ? "Files are uploaded directly to S3 using presigned URLs for faster performance"
            : "Files are processed through Next.js API endpoints for additional server-side validation"
          }
        </p>
      </div>
    </div>
  );
}

// This component contains all the client-side logic
export default function ClientContent() {
  // All state and effects live here
  const [files, setFiles] = useState<FileProps[]>([]);
  const [uploadMode, setUploadMode] = useState<fileUploadMode>("s3PresignedUrl");

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const body = (await response.json()) as FileProps[];
      setFiles(body.map((file) => ({ ...file, isDeleting: false })));
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  useEffect(() => {
    fetchFiles().catch(console.error);
  }, []);

  const downloadUsingPresignedUrl = uploadMode === "s3PresignedUrl";
  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUploadMode(event.target.value as fileUploadMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Mode Switch Section */}
          <ModeSwitchMenu
            uploadMode={uploadMode}
            handleModeChange={handleModeChange}
          />

          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {uploadMode === "s3PresignedUrl" ? "Direct S3 Upload" : "API Endpoint Upload"}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {uploadMode === "s3PresignedUrl" 
                      ? "Upload files directly to S3 storage for optimal performance"
                      : "Upload files through Next.js API with server-side validation"
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${uploadMode === "s3PresignedUrl" ? "bg-green-400" : "bg-blue-400"}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {uploadMode === "s3PresignedUrl" ? "S3 Mode" : "API Mode"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {uploadMode === "s3PresignedUrl" ? (
                <UploadFilesS3PresignedUrl onUploadSuccess={fetchFiles} />
              ) : (
                <UploadFilesRoute onUploadSuccess={fetchFiles} />
              )}
            </div>
          </div>

          {/* Files Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Your Files</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage and download your uploaded files</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{files.length} file(s)</span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <FilesContainer
                files={files}
                fetchFiles={fetchFiles}
                setFiles={setFiles}
                downloadUsingPresignedUrl={downloadUsingPresignedUrl}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure file management powered by S-Files
          </div>
        </div>
      </div>
    </div>
  );
}