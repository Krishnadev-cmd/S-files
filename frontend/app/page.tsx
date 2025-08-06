"use client"; // This directive marks the component as a Client Component

import { useState, useEffect } from "react";
// Reverting to alias imports as configured in tsconfig.json
import { UploadFilesS3PresignedUrl } from "@/app/components/UploadFilesForm/UploadFilesS3PresignedUrl";
import { FilesContainer } from "@/app/components/FileContainer";
import { UploadFilesRoute } from "@/app/components/UploadFilesForm/UploadFilesRoute";
import { type FileProps } from "@/app/utils/types"; // Using alias for types as well

// Define the type for file upload mode
export type fileUploadMode = "s3PresignedUrl" | "NextjsAPIEndpoint";

// Main Page component for the App Router
export default function Page() {
  // State to hold the list of files
  const [files, setFiles] = useState<FileProps[]>([]);
  // State to manage the current upload mode
  const [uploadMode, setUploadMode] = useState<fileUploadMode>("s3PresignedUrl");

  // Function to fetch files from the API
  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const body = (await response.json()) as FileProps[];
      // Set isDeleting to false for all files after fetching to ensure correct UI state
      setFiles(body.map((file) => ({ ...file, isDeleting: false })));
    } catch (error) {
      console.error("Failed to fetch files:", error);
      // Optionally, handle UI feedback for fetch error
    }
  };

  // Effect hook to fetch files on the first render of the component
  useEffect(() => {
    fetchFiles().catch(console.error);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Determine if downloads should use presigned URLs based on the current upload mode
  const downloadUsingPresignedUrl = uploadMode === "s3PresignedUrl";

  // Handler for changing the upload mode
  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUploadMode(event.target.value as fileUploadMode);
  };

  return (
    <main className="flex min-h-screen items-center justify-center gap-5 font-mono">
      <div className="container flex flex-col gap-5 px-3">
        {/* Component to switch between upload modes */}
        <ModeSwitchMenu
          uploadMode={uploadMode}
          handleModeChange={handleModeChange}
        />

        {/* Conditionally render the appropriate upload form based on the selected mode */}
        {uploadMode === "s3PresignedUrl" ? (
          <UploadFilesS3PresignedUrl onUploadSuccess={fetchFiles} />
        ) : (
          <UploadFilesRoute onUploadSuccess={fetchFiles} />
        )}

        {/* Component to display the list of uploaded files */}
        <FilesContainer
          files={files}
          fetchFiles={fetchFiles}
          setFiles={setFiles}
          downloadUsingPresignedUrl={downloadUsingPresignedUrl}
        />
      </div>
    </main>
  );
}

// Type definition for the ModeSwitchMenu component's props
export type ModeSwitchMenuProps = {
  uploadMode: fileUploadMode;
  handleModeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

// Component for switching between file upload modes
function ModeSwitchMenu({ uploadMode, handleModeChange }: ModeSwitchMenuProps) {
  return (
    <ul className="flex items-center justify-center gap-2">
      <li>
        <label htmlFor="uploadMode">Upload Mode:</label>
      </li>
      <li>
        <select
          className="rounded-md border-2 border-gray-300"
          id="uploadMode"
          value={uploadMode}
          onChange={handleModeChange}
        >
          <option value="s3PresignedUrl">S3 Presigned Url</option>
          <option value="NextjsAPIEndpoint">Next.js API Endpoint</option>
        </select>
      </li>
    </ul>
  );
}
