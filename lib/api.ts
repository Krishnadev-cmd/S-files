import axios from 'axios';
import Cookies from 'js-cookie';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;
          
          Cookies.set('access_token', access_token);
          Cookies.set('refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
  }) => apiClient.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),

  logout: () => apiClient.post('/auth/logout'),

  getCurrentUser: () => apiClient.get('/auth/me'),
};

// Files API
export const filesAPI = {
  uploadFile: (formData: FormData) =>
    apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  uploadMultipleFiles: (formData: FormData) =>
    apiClient.post('/files/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  listFiles: (params?: {
    folder_id?: number;
    skip?: number;
    limit?: number;
  }) => apiClient.get('/files/', { params }),

  searchFiles: (params: {
    query: string;
    file_types?: string;
    folder_id?: number;
    sort_by?: string;
    sort_order?: string;
    skip?: number;
    limit?: number;
  }) => apiClient.get('/files/search', { params }),

  getFile: (fileId: number) => apiClient.get(`/files/${fileId}`),

  downloadFile: (fileId: number) =>
    apiClient.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    }),

  updateFile: (fileId: number, updateData: any) =>
    apiClient.put(`/files/${fileId}`, updateData),

  deleteFile: (fileId: number) => apiClient.delete(`/files/${fileId}`),
};

// Folders API
export const foldersAPI = {
  createFolder: (folderData: { name: string; parent_id?: number }) =>
    apiClient.post('/folders/', folderData),

  listFolders: (params?: {
    parent_id?: number;
    skip?: number;
    limit?: number;
  }) => apiClient.get('/folders/', { params }),

  getFolder: (folderId: number) => apiClient.get(`/folders/${folderId}`),

  updateFolder: (folderId: number, updateData: any) =>
    apiClient.put(`/folders/${folderId}`, updateData),

  deleteFolder: (folderId: number, force?: boolean) =>
    apiClient.delete(`/folders/${folderId}`, { params: { force } }),

  getFolderBreadcrumb: (folderId: number) =>
    apiClient.get(`/folders/${folderId}/breadcrumb`),
};

export default apiClient;
