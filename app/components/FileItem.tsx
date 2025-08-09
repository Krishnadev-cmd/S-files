import { type FileProps } from "@/app/utils/types";
import { LoadSpinner } from "@/app/components/LoadSpinner";
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

  async function deleteFile(id: string) {
    setFiles((files: FileProps[]) =>
      files.map((file: FileProps) =>
        file.id === id ? { ...file, isDeleting: true } : file,
      ),
    );
    try {
      // delete file request to the server
      await fetch(`/api/files/delete/${id}`, {
        method: "DELETE",
      });
      // fetch files after deleting
      await fetchFiles();
    } catch (error) {
      console.error(error);
      alert("Failed to delete file");
    } finally {
      setFiles((files: FileProps[]) =>
        files.map((file: FileProps) =>
          file.id === id ? { ...file, isDeleting: false } : file,
        ),
      );
    }
  }

  // Depending on the upload mode, we either download the file using the presigned url from S3 or the Nextjs API endpoint.
  const downloadFile = async (file: FileProps) => {
    if (downloadUsingPresignedUrl) {
      const presignedUrl = await getPresignedUrl(file);
      window.open(presignedUrl, "_blank");
    } else {
      window.open(`/api/files/download/smallFiles/${file.id}`, "_blank");
    }
  };

  const handleGenerateClick = () => {
    setShowQuestionArea(!showQuestionArea);
  };

  const handleSubmitQuestion = async () => {
    if (!question.trim()) return;
    
    setIsGenerating(true);
    setResponse("");
    
    try {
      console.log("🚀 Submitting question to LLM API...");
      
      const response = await fetch("/api/llm/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: file.id,
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate response");
      }

      console.log("✅ Received response from LLM API");
      setResponse(data.response);
      
    } catch (error) {
      console.error("❌ Error submitting question:", error);
      alert(`Failed to generate response: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* File Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          {/* File Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate" title={file.originalFileName}>
              {file.originalFileName}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500 font-medium">
                {formatBytes(file.fileSize)}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Recently uploaded'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Download Button */}
          <button
            className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
            onClick={() => downloadFile(file)}
            title="Download file"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
          <button
            className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
            onClick={handleGenerateClick}
            title="Ask question about this file"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Generate
          </button>
          {/* Delete Button */}
          <button
            className="inline-flex items-center px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => deleteFile(file.id)}
            disabled={file.isDeleting}
          >
            {file.isDeleting ? (
              <>
                <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </>
            )}
          </button>
        </div>
      </div>

      {/* Question Text Area */}
      {showQuestionArea && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t border-gray-200">
          <label htmlFor={`question-${file.id}`} className="block text-sm font-medium text-gray-700 mb-2">
            Ask a question about this file:
          </label>
          <textarea
            id={`question-${file.id}`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question about the PDF or file content..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900"
            rows={3}
          />
          <div className="flex justify-end space-x-2 mt-3">
            <button
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              onClick={() => {
                setShowQuestionArea(false);
                setQuestion("");
                setResponse("");
              }}
            >
              Cancel
            </button>
            <button
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!question.trim() || isGenerating}
              onClick={handleSubmitQuestion}
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                "Submit Question"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Response Section */}
      {response && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-sm font-medium text-green-800">AI Response:</h4>
          </div>
          <div className="bg-white p-3 rounded-md border border-green-300">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{response}</p>
          </div>
          <button
            className="mt-2 px-3 py-1 text-xs font-medium text-green-600 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
            onClick={() => setResponse("")}
          >
            Clear Response
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {file.isDeleting && (
        <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <LoadSpinner size="small" />
            <span>Deleting file...</span>
          </div>
        </div>
      )}
    </div>
  );
}