"use client";

import { useState } from "react";
import { type UploadFilesFormUIProps } from "@/app/utils/types";
import { formatBytes } from "@/app/utils/fileUploadHelpers";

export function UploadFilesFormUI({
  isLoading,
  fileInputRef,
  uploadToServer,
  maxFileSize,
  selectedFiles = [],
  onFilesSelected,
  onRemoveFile,
}: UploadFilesFormUIProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onFilesSelected) {
        onFilesSelected(e.dataTransfer.files);
      }
    }
  };

  const totalSelectedSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <form onSubmit={uploadToServer} className="space-y-5">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        id="file-upload-input"
        onChange={(e) => {
          if (onFilesSelected && e.target.files) {
            onFilesSelected(e.target.files);
          }
        }}
      />

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-200 ${
          isDragActive
            ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 scale-[1.005]"
            : "border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-900/80"
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <svg
              className="w-7 h-7 text-indigo-400 group-hover:text-indigo-300 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-200">
              <span className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                Click to browse
              </span>{" "}
              or drag & drop files here
            </p>
            <p className="text-xs text-zinc-500">
              PDF, Images, Documents, Code, Archives • Up to {maxFileSize} MB total
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files Queue */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3 bg-zinc-900/80 border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-white/[0.06] pb-2">
            <span>
              Selected {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}
            </span>
            <span className="font-mono text-zinc-300">{formatBytes(totalSelectedSize)}</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between bg-zinc-800/70 hover:bg-zinc-800 border border-white/[0.04] rounded-lg px-3 py-2 text-xs transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
                  <div className="w-6 h-6 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 font-mono text-[10px]">
                    {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                  </div>
                  <span className="text-zinc-200 truncate font-medium" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-zinc-500 font-mono text-[11px] flex-shrink-0">
                    ({formatBytes(file.size)})
                  </span>
                </div>

                {onRemoveFile && !isLoading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(idx);
                    }}
                    className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-white/[0.05] transition-colors"
                    title="Remove file"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action / Upload Button */}
      <button
        type="submit"
        disabled={isLoading || selectedFiles.length === 0}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Uploading directly to storage...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>
              {selectedFiles.length > 0
                ? `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? "s" : ""}`
                : "Select Files to Upload"}
            </span>
          </>
        )}
      </button>

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
        <svg className="w-3.5 h-3.5 text-emerald-500/80" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Direct Presigned S3/R2 Upload • High Speed & End-to-End Encryption</span>
      </div>
    </form>
  );
}
