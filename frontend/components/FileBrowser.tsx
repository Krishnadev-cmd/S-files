'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Folder, 
  File as FileIcon, 
  Download, 
  Trash2, 
  Edit, 
  MoreVertical,
  Grid,
  List,
  ChevronRight,
  Home
} from '@/components/icons';
import { filesAPI, foldersAPI } from '@/lib/api';

interface File {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  content_type: string | null;
  folder_id: number | null;
  created_at: string;
  updated_at: string | null;
  is_public: boolean;
}

interface FolderType {
  id: number;
  name: string;
  path: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string | null;
}

interface FileBrowserProps {
  currentFolderId?: number | null;
  onFolderChange?: (folderId: number | null) => void;
  onFileSelect?: (file: File) => void;
}

export default function FileBrowser({
  currentFolderId = null,
  onFolderChange,
  onFileSelect,
}: FileBrowserProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    files: File[];
    folders: FolderType[];
  }>({ files: [], folders: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [breadcrumb, setBreadcrumb] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFolderContents();
    if (currentFolderId) {
      loadBreadcrumb();
    } else {
      setBreadcrumb([]);
    }
  }, [currentFolderId]);

  const loadFolderContents = async () => {
    setIsLoading(true);
    try {
      const [filesResponse, foldersResponse] = await Promise.all([
        filesAPI.listFiles({ folder_id: currentFolderId || undefined }),
        foldersAPI.listFolders({ parent_id: currentFolderId || undefined }),
      ]);

      setFiles(filesResponse.data);
      setFolders(foldersResponse.data);
    } catch (error) {
      console.error('Error loading folder contents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBreadcrumb = async () => {
    if (!currentFolderId) return;
    
    try {
      const response = await foldersAPI.getFolderBreadcrumb(currentFolderId);
      setBreadcrumb(response.data.breadcrumb);
    } catch (error) {
      console.error('Error loading breadcrumb:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ files: [], folders: [] });
      return;
    }

    try {
      const response = await filesAPI.searchFiles({
        query,
        folder_id: currentFolderId || undefined,
      });

      setSearchResults({
        files: response.data.files,
        folders: response.data.folders,
      });
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    setTimeout(() => {
      if (query === searchQuery) {
        handleSearch(query);
      }
    }, 300);
  };

  const handleFolderClick = (folder: FolderType) => {
    onFolderChange?.(folder.id);
  };

  const handleFileClick = (file: File) => {
    onFileSelect?.(file);
  };

  const handleDownload = async (file: File) => {
    try {
      const response = await filesAPI.downloadFile(file.id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (id: string, type: 'file' | 'folder') => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (type === 'file') {
        await filesAPI.deleteFile(parseInt(id));
        setFiles(prev => prev.filter(f => f.id !== parseInt(id)));
      } else {
        await foldersAPI.deleteFolder(parseInt(id));
        setFolders(prev => prev.filter(f => f.id !== parseInt(id)));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (contentType: string | null) => {
    if (!contentType) return <FileIcon className="h-5 w-5" />;
    
    if (contentType.startsWith('image/')) {
      return <FileIcon className="h-5 w-5 text-green-500" />;
    } else if (contentType.startsWith('video/')) {
      return <FileIcon className="h-5 w-5 text-red-500" />;
    } else if (contentType.startsWith('audio/')) {
      return <FileIcon className="h-5 w-5 text-purple-500" />;
    } else if (contentType.includes('pdf')) {
      return <FileIcon className="h-5 w-5 text-red-600" />;
    } else if (contentType.includes('word') || contentType.includes('document')) {
      return <FileIcon className="h-5 w-5 text-blue-600" />;
    } else if (contentType.includes('sheet') || contentType.includes('excel')) {
      return <FileIcon className="h-5 w-5 text-green-600" />;
    }
    
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  const displayItems = searchQuery ? searchResults : { files, folders };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <button
              onClick={() => onFolderChange?.(null)}
              className="flex items-center space-x-1 hover:text-gray-700"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
            {breadcrumb.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4" />
                <button
                  onClick={() => onFolderChange?.(item.id)}
                  className="hover:text-gray-700"
                >
                  {item.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <List className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search files and folders..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-2'}>
          {/* Folders */}
          {displayItems.folders.map((folder) => (
            <div
              key={`folder-${folder.id}`}
              className={`
                ${viewMode === 'grid' 
                  ? 'p-4 border rounded-lg hover:bg-gray-50 cursor-pointer' 
                  : 'flex items-center justify-between p-3 hover:bg-gray-50 rounded cursor-pointer'
                }
              `}
              onClick={() => handleFolderClick(folder)}
            >
              <div className="flex items-center space-x-3">
                <Folder className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {folder.name}
                  </p>
                  {viewMode === 'list' && (
                    <p className="text-xs text-gray-500">
                      {formatDate(folder.created_at)}
                    </p>
                  )}
                </div>
              </div>
              
              {viewMode === 'list' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(folder.id.toString(), 'folder');
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Files */}
          {displayItems.files.map((file) => (
            <div
              key={`file-${file.id}`}
              className={`
                ${viewMode === 'grid' 
                  ? 'p-4 border rounded-lg hover:bg-gray-50 cursor-pointer' 
                  : 'flex items-center justify-between p-3 hover:bg-gray-50 rounded cursor-pointer'
                }
              `}
              onClick={() => handleFileClick(file)}
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file.content_type)}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.original_filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file_size)}
                    {viewMode === 'list' && ` • ${formatDate(file.created_at)}`}
                  </p>
                </div>
              </div>
              
              {viewMode === 'list' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.id.toString(), 'file');
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && displayItems.files.length === 0 && displayItems.folders.length === 0 && (
        <div className="text-center py-12">
          <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchQuery ? 'No results found' : 'No files or folders'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Upload some files to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
}
