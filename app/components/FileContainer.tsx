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
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-white/[0.08] rounded-2xl bg-zinc-900/30">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-white/[0.06] flex items-center justify-center text-zinc-500 mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-zinc-300">No files found</h3>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          No files in this bucket match your criteria. Drag and drop files above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
  );
}