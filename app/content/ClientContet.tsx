// app/ClientContent.tsx
"use client";

import { useState, useEffect } from "react";
import { UploadFilesS3PresignedUrl } from "@/app/components/UploadFilesForm/UploadFilesS3PresignedUrl";
import { FilesContainer } from "@/app/components/FileContainer";
import { type FileProps } from "@/app/utils/types";

// This component contains all the client-side logic
export default function ClientContent() {
  // All state and effects live here
  const [files, setFiles] = useState<FileProps[]>([]);

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

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dark:bg-black">
        <div className="space-y-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden dark:bg-neutral-900">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6  dark:bg-gradient-to-r dark:from-black dark:to-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Direct S3 Upload</h2>
                  <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">
                    Upload files directly to S3 storage for optimal performance
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-sm font-medium text-gray-700">S3 Mode</span>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-white dark:bg-black">
              <UploadFilesS3PresignedUrl onUploadSuccess={fetchFiles} />
            </div>
          </div>

          {/* Files Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden  dark:bg-black">
            <div className="bg-white px-8 py-6  dark:bg-black">
              <div className="flex items-center justify-between dark:bg-black">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Files</h2>
                  <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">Manage and download your uploaded files</p>
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
                downloadUsingPresignedUrl={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white mt-16 dark:bg-black">
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