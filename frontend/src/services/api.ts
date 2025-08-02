import axios, { AxiosResponse, AxiosProgressEvent } from 'axios';
import toast from 'react-hot-toast';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Conversation,
  Message,
  ChatRequest,
  ChatResponse,
  Document,
  DocumentSearchRequest,
  DocumentSearchResponse,
  ApiError,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://enterprise-ai-brain-production.up.railway.app';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    const errorMessage = error.response?.data?.detail || 'An error occurred';
    toast.error(errorMessage);
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: RegisterData): Promise<AxiosResponse<User>> =>
    api.post('/auth/register', data),
  
  login: (data: LoginCredentials): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),
  
  getCurrentUser: (): Promise<AxiosResponse<User>> =>
    api.get('/auth/me'),
};

// Users API
export const usersApi = {
  getUsers: (): Promise<AxiosResponse<User[]>> =>
    api.get('/users'),
  
  getUser: (id: number): Promise<AxiosResponse<User>> =>
    api.get(`/users/${id}`),
  
  updateCurrentUser: (data: Partial<User>): Promise<AxiosResponse<User>> =>
    api.put('/users/me', data),
};

// Chat API
export const chatApi = {
  createConversation: (title: string): Promise<AxiosResponse<Conversation>> =>
    api.post('/chat/conversations', { title }),
  
  getConversations: (): Promise<AxiosResponse<Conversation[]>> =>
    api.get('/chat/conversations'),
  
  getConversationMessages: (conversationId: number): Promise<AxiosResponse<Message[]>> =>
    api.get(`/chat/conversations/${conversationId}/messages`),
  
  sendMessage: (data: ChatRequest): Promise<AxiosResponse<ChatResponse>> =>
    api.post('/chat/', data),
  
  deleteConversation: (conversationId: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/chat/conversations/${conversationId}`),
  
  searchDocuments: (data: DocumentSearchRequest): Promise<AxiosResponse<DocumentSearchResponse>> =>
    api.post('/chat/search', data),
  
};

// Documents API
export const documentsApi = {
  uploadDocument: (
    file: File, 
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<AxiosResponse<Document>> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  
  processDocument: (id: number): Promise<AxiosResponse<any>> =>
    api.post(`/documents/process/${id}`),
  
  getDocuments: (): Promise<AxiosResponse<Document[]>> =>
    api.get('/documents/'),
  
  getDocument: (id: number): Promise<AxiosResponse<Document>> =>
    api.get(`/documents/${id}`),
  
  getDocumentChunks: (id: number, skip = 0, limit = 50): Promise<AxiosResponse<any[]>> =>
    api.get(`/documents/${id}/chunks?skip=${skip}&limit=${limit}`),
  
  getProcessingStatus: (id: number): Promise<AxiosResponse<any>> =>
    api.get(`/documents/${id}/status`),
  
  deleteDocument: (id: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/documents/${id}`),
  
  downloadDocument: (id: number): Promise<AxiosResponse<Blob>> =>
    api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    }),
  
  viewDocument: (id: number): Promise<AxiosResponse<Blob>> =>
    api.get(`/documents/${id}/view`, {
      responseType: 'blob',
    }),
};

// Enterprise AI Brain API
export const enterpriseApi = {
  // Basic system info
  getSystemInfo: (): Promise<AxiosResponse<any>> =>
    axios.get(`${API_BASE_URL}/system/info`),
  
  testHealth: (): Promise<AxiosResponse<any>> =>
    axios.get(`${API_BASE_URL}/health`),
  
  testDatabase: (): Promise<AxiosResponse<any>> =>
    axios.get(`${API_BASE_URL}/test-database`),
  
  // Enterprise queries
  simpleQuery: (query: string): Promise<AxiosResponse<any>> =>
    axios.post(`${API_BASE_URL}/api/enterprise/simple-query`, { query }),
};

export default api;