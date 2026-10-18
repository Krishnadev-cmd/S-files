"use client";

import { type FileProps } from "@/app/utils/types";
import { formatBytes } from "@/app/utils/fileUploadHelpers";
import { useState } from "react";

type FileItemProps = {
  file: FileProps;
  fetchFiles: () => Promise<void>;
  setFiles: (
    files: FileProps[] | ((files: FileProps[]) => FileProps[]),
  ) => void;
  downloadUsingPresignedUrl: boolean;
};

async function getPresignedUrl(file: FileProps) {
  const response = await fetch(`/api/files/download/presignedUrl/${file.id}`);
  return (await response.json()) as string;
}

function getFileExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext || "file";
}

function getFileIcon(extension: string) {
  switch (extension) {
    case "pdf":
      return (
        <span className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-mono text-[10px] font-bold">
          PDF
        </span>
      );
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "svg":
      return (
        <span className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-mono text-[10px] font-bold">
          IMG
        </span>
      );
    case "zip":
    case "tar":
    case "gz":
    case "rar":
      return (
        <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-mono text-[10px] font-bold">
          ZIP
        </span>
      );
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "json":
    case "py":
      return (
        <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-mono text-[10px] font-bold">
          CODE
        </span>
      );
    default:
      return (
        <span className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-mono text-[10px] font-bold">
          DOC
        </span>
      );
  }
}

export function FileItem({
  file,
  fetchFiles,
  setFiles,
  downloadUsingPresignedUrl,
}: FileItemProps) {
  const [showQuestionArea, setShowQuestionArea] = useState(false);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const ext = getFileExtension(file.originalFileName);

  async function deleteFile(id: string) {
    if (!confirm(`Are you sure you want to delete "${file.originalFileName}"?`)) {
      return;
    }

    setFiles((files: FileProps[]) =>
      files.map((f: FileProps) =>
        f.id === id ? { ...f, isDeleting: true } : f,
      ),
    );
    try {
      await fetch(`/api/files/delete/${id}`, {
        method: "DELETE",
      });
      await fetchFiles();
    } catch (error) {
      console.error(error);
      alert("Failed to delete file");
    } finally {
      setFiles((files: FileProps[]) =>
        files.map((f: FileProps) =>
          f.id === id ? { ...f, isDeleting: false } : f,
        ),
      );
    }
  }

  const downloadFile = async (file: FileProps) => {
    try {
      if (downloadUsingPresignedUrl) {
        const presignedUrl = await getPresignedUrl(file);
        window.open(presignedUrl, "_blank");
      } else {
        window.open(`/api/files/download/smallFiles/${file.id}`, "_blank");
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to initiate download");
    }
  };

  const handleSubmitQuestion = async (customQ?: string) => {
    const q = customQ || question;
    if (!q.trim()) return;

    setIsGenerating(true);
    setResponse("");

    try {
      const res = await fetch("/api/llm/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: file.id,
          question: q.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || "Failed to generate AI response");
      }

      setResponse(data.response);
    } catch (error) {
      console.error("AI Error:", error);
      alert(error instanceof Error ? error.message : "AI generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-zinc-900/50 hover:bg-zinc-900/90 border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-4 transition-all duration-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* File Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {getFileIcon(ext)}
          <div className="min-w-0 flex-1">
            <h3
              className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors"
              title={file.originalFileName}
            >
              {file.originalFileName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
              <span className="font-mono text-zinc-400">{formatBytes(file.fileSize)}</span>
              <span>•</span>
              <span>
                {file.createdAt
                  ? new Date(file.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Uploaded"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
          {/* Ask AI / Gemini */}
          <button
            onClick={() => setShowQuestionArea(!showQuestionArea)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showQuestionArea
                ? "bg-zinc-800 text-zinc-100 border-zinc-600"
                : "bg-zinc-850 hover:bg-zinc-800 text-zinc-200 hover:text-white border-zinc-700"
            }`}
            title="Ask questions about this file using Gemini AI"
          >
            <span className="text-sm">🤖</span>
            <span>Ask AI</span>
          </button>

          {/* Download */}
          <button
            onClick={() => downloadFile(file)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-200 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            title="Download file"
          >
            <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => deleteFile(file.id)}
            disabled={file.isDeleting}
            className="inline-flex items-center justify-center p-2 text-xs font-medium rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 disabled:opacity-40 transition-colors"
            title="Delete file"
          >
            {file.isDeleting ? (
              <svg className="w-3.5 h-3.5 animate-spin text-red-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Gemini AI Q&A Panel */}
      {showQuestionArea && (
        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🤖</span>
              <span className="font-medium text-zinc-200">Gemini AI Assistant</span>
              <span className="text-[10px] text-zinc-500 font-mono">({file.originalFileName})</span>
            </div>
            <button
              onClick={() => {
                setShowQuestionArea(false);
                setResponse("");
              }}
              className="text-zinc-400 hover:text-zinc-200 text-xs"
            >
              Close
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1.5">
            {[
              "Summarize this document",
              "Extract key takeaways",
              "What is the main topic?",
            ].map((promptText) => (
              <button
                key={promptText}
                type="button"
                onClick={() => {
                  setQuestion(promptText);
                  handleSubmitQuestion(promptText);
                }}
                disabled={isGenerating}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitQuestion();
                }
              }}
              placeholder="Ask a question about this file's contents..."
              className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
            />
            <button
              onClick={() => handleSubmitQuestion()}
              disabled={isGenerating || !question.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Thinking...</span>
                </>
              ) : (
                <span>Ask</span>
              )}
            </button>
          </div>

          {/* AI Response Box */}
          {response && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 space-y-2 mt-2">
              <div className="flex items-center justify-between text-zinc-300 font-medium">
                <span className="flex items-center gap-1.5 text-zinc-200">
                  <span>🤖</span> Answer
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyResponse}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    {copied ? "Copied! ✓" : "Copy"}
                  </button>
                  <button
                    onClick={() => setResponse("")}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-zinc-300">{response}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}