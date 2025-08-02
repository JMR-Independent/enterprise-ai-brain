import { create } from 'zustand';
import { documentsApi, chatApi } from '@/services/api';
import { Document, FileUploadProgress, DocumentSearchResponse } from '@/types';
import toast from 'react-hot-toast';

interface DocumentState {
  documents: Document[];
  uploadProgress: FileUploadProgress[];
  isLoading: boolean;
  searchResults: DocumentSearchResponse | null;
  
  // Actions
  loadDocuments: () => Promise<void>;
  uploadDocument: (file: File) => Promise<Document>;
  deleteDocument: (id: number) => Promise<void>;
  searchDocuments: (query: string, maxResults?: number) => Promise<DocumentSearchResponse>;
  processDocument: (id: number) => Promise<void>;
  refreshDocument: (id: number) => Promise<void>;
  clearSearchResults: () => void;
  setLoading: (loading: boolean) => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  uploadProgress: [],
  isLoading: false,
  searchResults: null,

  loadDocuments: async () => {
    try {
      set({ isLoading: true });
      const response = await documentsApi.getDocuments();
      set({ documents: response.data });
    } catch (error: any) {
      console.error('Load documents error:', error);
      toast.error('Failed to load documents');
    } finally {
      set({ isLoading: false });
    }
  },

  uploadDocument: async (file: File) => {
    const progressId = Math.random().toString(36).substr(2, 9);
    
    // Add to upload progress
    const uploadProgress: FileUploadProgress = {
      file,
      progress: 0,
      status: 'uploading',
    };
    
    set((state) => ({
      uploadProgress: [...state.uploadProgress, { ...uploadProgress }]
    }));

    try {
      const response = await documentsApi.uploadDocument(file, (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          
          set((state) => ({
            uploadProgress: state.uploadProgress.map((item) =>
              item.file === file ? { ...item, progress, status: 'uploading' } : item
            ),
          }));
        }
      });

      const document = response.data;
      
      // Update progress to processing
      set((state) => ({
        uploadProgress: state.uploadProgress.map((item) =>
          item.file === file ? { ...item, progress: 100, status: 'processing' } : item
        ),
        documents: [document, ...state.documents],
      }));

      // Remove from progress after a delay
      setTimeout(() => {
        set((state) => ({
          uploadProgress: state.uploadProgress.filter((item) => item.file !== file),
        }));
      }, 2000);

      toast.success(`File "${file.name}" uploaded successfully!`);
      return document;
    } catch (error: any) {
      console.error('Upload document error:', error);
      
      // Update progress to error
      set((state) => ({
        uploadProgress: state.uploadProgress.map((item) =>
          item.file === file 
            ? { ...item, status: 'error', error: error.response?.data?.detail || 'Upload failed' }
            : item
        ),
      }));

      // Remove from progress after delay
      setTimeout(() => {
        set((state) => ({
          uploadProgress: state.uploadProgress.filter((item) => item.file !== file),
        }));
      }, 5000);

      throw error;
    }
  },

  deleteDocument: async (id: number) => {
    try {
      await documentsApi.deleteDocument(id);
      
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
      }));
      
      toast.success('Document deleted successfully');
    } catch (error: any) {
      console.error('Delete document error:', error);
      toast.error('Failed to delete document');
    }
  },

  searchDocuments: async (query: string, maxResults = 10) => {
    try {
      set({ isLoading: true });
      const response = await chatApi.searchDocuments({ query, max_results: maxResults });
      const searchResults = response.data;
      
      set({ searchResults });
      return searchResults;
    } catch (error: any) {
      console.error('Search documents error:', error);
      toast.error('Failed to search documents');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  processDocument: async (id: number) => {
    try {
      await documentsApi.processDocument(id);
      
      // Update document status
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, processing_status: 'processing' } : doc
        ),
      }));
      
      toast.success('Document processing started');
    } catch (error: any) {
      console.error('Process document error:', error);
      toast.error('Failed to process document');
    }
  },

  refreshDocument: async (id: number) => {
    try {
      const response = await documentsApi.getDocument(id);
      const updatedDocument = response.data;
      
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? updatedDocument : doc
        ),
      }));
    } catch (error: any) {
      console.error('Refresh document error:', error);
    }
  },

  clearSearchResults: () => {
    set({ searchResults: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));