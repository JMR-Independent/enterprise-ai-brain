// User and Authentication Types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Message Types
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface Message {
  id: number;
  role: MessageRole;
  content: string;
  created_at: string;
}

// Conversation Types
export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at?: string;
}

// Document Types
export interface Document {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  content_type: string;
  processed: boolean;
  processing_status: string;
  error_message?: string;
  page_count?: number;
  word_count?: number;
  character_count?: number;
  chunk_count: number;
  processing_time?: number;
  metadata?: Record<string, any>;
  created_at: string;
  processed_at?: string;
}

export interface DocumentChunk {
  id: number;
  chunk_index: number;
  content: string;
  start_char?: number;
  end_char?: number;
  page_number?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

// Chat Types
export interface SourceDocument {
  document_id?: number;
  filename?: string;
  page_number?: number;
  chunk_index?: number;
  relevance_score: number;
  content_preview: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: number;
  use_rag?: boolean;
  max_documents?: number;
}

export interface ChatResponse {
  conversation_id: number;
  message: Message;
  response: Message;
  source_documents: SourceDocument[];
  rag_used: boolean;
}

export interface DocumentSearchRequest {
  query: string;
  max_results?: number;
}

export interface DocumentSearchResponse {
  query: string;
  results: SourceDocument[];
  total_found: number;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  detail: string;
}

// File Upload Types
export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}