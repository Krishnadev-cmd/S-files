'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, File as FileIcon } from '@/components/icons';
import { filesAPI } from '@/lib/api';

interface FileUploadProps {
  folderId?: number;
  onUploadComplete?: (files: any[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  id: string;
  error?: string;
}

export default function FileUpload({
  folderId,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async (file: File) => {
    const uploadId = Math.random().toString(36).substr(2, 9);
    
    // Add file to uploading list
    setUploadingFiles(prev => [...prev, {
      file,
      progress: 0,
      status: 'uploading',
      id: uploadId,
    }]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) {
        formData.append('folder_id', folderId.toString());
      }

      // Simulate progress (since we can't track real progress with current setup)
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadId && f.progress < 90 
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      const response = await filesAPI.uploadFile(formData);
      
      clearInterval(progressInterval);
      
      // Mark as completed
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === uploadId
            ? { ...f, progress: 100, status: 'completed' as const }
            : f
        )
      );

      return response.data;
    } catch (error: any) {
      // Mark as error
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === uploadId
            ? { 
                ...f, 
                status: 'error' as const, 
                error: error.response?.data?.detail || 'Upload failed' 
              }
            : f
        )
      );
      throw error;
    }
  };

  const uploadMultipleFiles = async (files: File[]) => {
    const uploadPromises = files.map(file => uploadFile(file));
    
    try {
      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value);
      
      if (onUploadComplete && successfulUploads.length > 0) {
        onUploadComplete(successfulUploads);
      }

      // Clear completed uploads after a delay
      setTimeout(() => {
        setUploadingFiles(prev => 
          prev.filter(f => f.status !== 'completed')
        );
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsDragActive(false);
    
    // Filter files by size
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}`);
        return false;
      }
      return true;
    });

    if (validFiles.length > maxFiles) {
      alert(`Too many files. Maximum is ${maxFiles} files at once.`);
      return;
    }

    if (validFiles.length > 0) {
      uploadMultipleFiles(validFiles);
    }
  }, [maxFiles, maxSize]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    multiple: true,
    maxFiles,
    maxSize,
  });

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <Upload className={`h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Maximum {maxFiles} files, up to {formatFileSize(maxSize)} each
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Uploading Files</h3>
          <div className="space-y-3">
            {uploadingFiles.map((uploadingFile) => (
              <div
                key={uploadingFile.id}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileIcon className="h-8 w-8 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {uploadingFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadingFile.file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {uploadingFile.status === 'uploading' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadingFile.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {uploadingFile.progress}%
                        </span>
                      </div>
                    )}
                    
                    {uploadingFile.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    
                    {uploadingFile.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    
                    <button
                      onClick={() => removeUploadingFile(uploadingFile.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {uploadingFile.status === 'error' && uploadingFile.error && (
                  <p className="text-xs text-red-600 mt-2">
                    {uploadingFile.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
