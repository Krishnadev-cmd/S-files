import { type FilesListProps } from "@/app/utils/types";
import { FileItem } from "./FileItem";

export function FilesContainer({
  files,
  fetchFiles,
  setFiles,
  downloadUsingPresignedUrl,
}: FilesListProps) {
  if (files.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4 dark:bg-neutral-900">
        <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-neutral-800 dark:to-neutral-700 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-medium text-gray-700 dark:text-gray-200">No files uploaded yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload your first file to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-700 pb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {files.length} uploaded file{files.length > 1 ? "s" : ""}
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Most recent files shown first
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            fetchFiles={fetchFiles}
            setFiles={setFiles}
            downloadUsingPresignedUrl={downloadUsingPresignedUrl}
          />
        ))}
      </div>
    </div>
  );
}