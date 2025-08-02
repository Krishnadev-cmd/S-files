'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FileBrowser from '@/components/FileBrowser';
import FileUpload from '@/components/FileUpload';
import {
  LogOut,
  Plus,
  FolderPlus,
  Upload as UploadIcon,
  User,
  Settings,
  HardDrive
} from '@/components/icons';
import { foldersAPI } from '@/lib/api';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/auth/login');
    }
  }, [status, session, router]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      await foldersAPI.createFolder({
        name: newFolderName,
        parent_id: currentFolderId || undefined,
      });

      setNewFolderName('');
      setShowCreateFolderModal(false);
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // No session fallback
  if (!session || !session.user) return null;

  // Simulated user storage info (you can replace this with your actual backend info)
  const user = {
    ...session.user,
    storage_used: 2 * 1024 * 1024 * 1024, // 2GB
    storage_quota: 10 * 1024 * 1024 * 1024, // 10GB
  };

  const storageUsedPercentage = (user.storage_used / user.storage_quota) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">S-Files</h1>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <HardDrive className="h-4 w-4" />
                <span>
                  {formatBytes(user.storage_used)} / {formatBytes(user.storage_quota)} used
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      storageUsedPercentage > 90
                        ? 'bg-red-500'
                        : storageUsedPercentage > 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(storageUsedPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {user.name || user.email}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-4">
            <div className="bg-white rounded-lg shadow p-4 space-y-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <UploadIcon className="h-4 w-4" />
                <span>Upload Files</span>
              </button>

              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FolderPlus className="h-4 w-4" />
                <span>New Folder</span>
              </button>
            </div>

            {/* Storage Info */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Storage</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used</span>
                  <span className="font-medium">{formatBytes(user.storage_used)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">{formatBytes(user.storage_quota)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      storageUsedPercentage > 90
                        ? 'bg-red-500'
                        : storageUsedPercentage > 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(storageUsedPercentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {storageUsedPercentage.toFixed(1)}% used
                </div>
              </div>
            </div>
          </div>

          {/* File Browser */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <FileBrowser
                  currentFolderId={currentFolderId}
                  onFolderChange={setCurrentFolderId}
                  onFileSelect={(file) => {
                    console.log('File selected:', file);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>

              <FileUpload
                folderId={currentFolderId || undefined}
                onUploadComplete={(files) => {
                  console.log('Upload complete:', files);
                  setShowUploadModal(false);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Create New Folder</h2>
                <button
                  onClick={() => {
                    setShowCreateFolderModal(false);
                    setNewFolderName('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreateFolder}>
                <div className="mb-4">
                  <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    id="folderName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateFolderModal(false);
                      setNewFolderName('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingFolder}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isCreatingFolder ? 'Creating...' : 'Create Folder'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
