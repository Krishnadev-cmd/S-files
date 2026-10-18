"use client";

import { useState, useEffect } from "react";
import { UploadFilesS3PresignedUrl } from "@/app/components/UploadFilesForm/UploadFilesS3PresignedUrl";
import { FilesContainer } from "@/app/components/FileContainer";
import BucketAuth from "@/app/components/BucketAuth";
import { useBucket } from "@/contexts/bucket-context";
import { type FileProps } from "@/app/utils/types";
import { formatBytes } from "@/app/utils/fileUploadHelpers";

export default function ClientContent() {
  const [files, setFiles] = useState<FileProps[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { currentBucket, isAuthenticated } = useBucket();

  const fetchFiles = async () => {
    if (!currentBucket) return;
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/files?bucket=${currentBucket}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const body = (await response.json()) as FileProps[];
      setFiles(body.map((file) => ({ ...file, isDeleting: false })));
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentBucket) {
      fetchFiles().catch(console.error);
    }
  }, [isAuthenticated, currentBucket]);

  if (!isAuthenticated || !currentBucket) {
    return <BucketAuth />;
  }

  const totalBytes = files.reduce((acc, f) => acc + (f.fileSize || 0), 0);
  const filteredFiles = files.filter((f) =>
    f.originalFileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Bucket Overview Bar */}
        <div className="bg-zinc-900/70 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <span>Storage</span>
                <span>/</span>
                <span className="text-zinc-300">Buckets</span>
                <span>/</span>
                <span className="text-indigo-400 font-mono">{currentBucket}</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{currentBucket}</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active R2 / S3
                </span>
              </div>
            </div>

            {/* Quick Stats & Refresh */}
            <div className="flex items-center gap-3">
              <div className="bg-zinc-800/80 border border-white/[0.06] rounded-xl px-4 py-2 text-left">
                <div className="text-[11px] font-medium text-zinc-400">Total Files</div>
                <div className="text-lg font-bold text-white font-mono">{files.length}</div>
              </div>
              <div className="bg-zinc-800/80 border border-white/[0.06] rounded-xl px-4 py-2 text-left">
                <div className="text-[11px] font-medium text-zinc-400">Storage Used</div>
                <div className="text-lg font-bold text-zinc-200 font-mono">{formatBytes(totalBytes)}</div>
              </div>
              <button
                onClick={fetchFiles}
                disabled={isRefreshing}
                title="Refresh file list"
                className="p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.06] text-zinc-300 hover:text-white transition-all disabled:opacity-50"
              >
                <svg
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Upload Panel */}
        <section className="bg-zinc-900/60 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">Direct Upload</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload files straight to your bucket with signed URLs
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-800/60 px-2.5 py-1 rounded-lg border border-white/[0.05]">
              Max 100 MB
            </span>
          </div>

          <UploadFilesS3PresignedUrl onUploadSuccess={fetchFiles} />
        </section>

        {/* Files Panel */}
        <section className="bg-zinc-900/60 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">Bucket Files</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Download, preview, or query files with Gemini AI
              </p>
            </div>

            {/* File Search */}
            {files.length > 0 && (
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Filter files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-800/70 border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-1.5 pl-8 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
                />
                <svg
                  className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            )}
          </div>

          <FilesContainer
            files={filteredFiles}
            fetchFiles={fetchFiles}
            setFiles={setFiles}
            downloadUsingPresignedUrl={true}
          />
        </section>
      </main>
    </div>
  );
}