import { type FileProps } from "@/app/utils/types";
import { LoadSpinner } from "@/app/components/LoadSpinner";
import { formatBytes } from "@/app/utils/fileUploadHelpers";

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