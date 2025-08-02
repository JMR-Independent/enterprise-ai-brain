import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  LinearProgress,
  Fade,
  Paper,
  Menu,
  MenuItem,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as TxtIcon,
  Article as DocIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  HourglassEmpty as ProcessingIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { documentsApi } from '../services/api';
import { Document } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Documents: React.FC = () => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch documents with auto-refresh for processing documents
  const { data: documents, isLoading } = useQuery(
    'documents',
    () => documentsApi.getDocuments(),
    {
      onSuccess: (response) => {
        setUploadError(null);
      },
      // Auto-refresh every 3 seconds if there are processing documents
      refetchInterval: (data) => {
        if (data?.data?.some((doc: Document) => 
          !doc.processed && doc.processing_status === 'processing'
        )) {
          return 3000; // 3 seconds
        }
        return false; // Don't auto-refresh if all documents are processed
      },
    }
  );

  // Upload document mutation
  const uploadMutation = useMutation(documentsApi.uploadDocument, {
    onSuccess: () => {
      queryClient.invalidateQueries('documents');
      setUploadError(null);
    },
    onError: (error: any) => {
      setUploadError(error.response?.data?.detail || 'Upload failed');
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation(documentsApi.deleteDocument, {
    onSuccess: () => {
      queryClient.invalidateQueries('documents');
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadMutation.mutate(acceptedFiles[0]);
      }
    },
  });

  const handleDelete = async (documentId: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteMutation.mutateAsync(documentId);
    }
  };



  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, document: Document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleMenuAction = async (action: string) => {
    if (!selectedDocument) return;

    switch (action) {
      case 'delete':
        await handleDelete(selectedDocument.id);
        break;
    }
    handleMenuClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'application/pdf':
        return 'error';
      case 'text/plain':
        return 'info';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getFileIcon = (contentType: string) => {
    switch (contentType) {
      case 'application/pdf':
        return <PdfIcon />;
      case 'text/plain':
        return <TxtIcon />;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <DocIcon />;
      default:
        return <FileIcon />;
    }
  };

  const getStatusIcon = (document: Document) => {
    if (document.processed || document.processing_status === 'completed') {
      return <CheckIcon color="success" />;
    } else if (document.processing_status === 'failed') {
      return <ErrorIcon color="error" />;
    } else {
      return <ProcessingIcon color="warning" />;
    }
  };

  const getFileTypeBackgroundColor = (contentType: string) => {
    switch (contentType) {
      case 'application/pdf':
        return '#ff5722';
      case 'text/plain':
        return '#2196f3';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '#1976d2';
      default:
        return '#9e9e9e';
    }
  };

  // Filter and search documents
  const filteredDocuments = documents?.data?.filter((document: Document) => {
    const matchesSearch = document.original_filename
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || 
      document.content_type.includes(filterType);
    
    return matchesSearch && matchesType;
  }) || [];

  if (isLoading) {
    return <LoadingSpinner message="Loading documents..." />;
  }

  return (
    <Box sx={{ p: 3, width: '100%', height: '100%', backgroundColor: '#1a1a1a', color: '#e5e5e5' }}>
      {/* Modern Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)',
        borderRadius: 3,
        p: 4,
        mb: 3,
        color: '#e5e5e5',
        border: '1px solid #444'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Document Management
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Upload and manage your AI knowledge base documents
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Chip 
            label={`${documents?.data?.length || 0} Documents`} 
            sx={{ bgcolor: 'rgba(229,229,229,0.2)', color: '#e5e5e5' }}
          />
          <Chip 
            label={`${documents?.data?.filter((d: Document) => d.processed || d.processing_status === 'completed').length || 0} Processed`}
            sx={{ bgcolor: 'rgba(229,229,229,0.2)', color: '#e5e5e5' }}
          />
        </Box>
      </Box>

      {/* Search and Filter Bar */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        backgroundColor: '#2a2a2a', 
        border: '1px solid #444',
        borderRadius: 3 
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="🔍 Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1a1a1a',
                color: '#e5e5e5',
                '& fieldset': {
                  borderColor: '#444',
                },
                '&:hover fieldset': {
                  borderColor: '#666',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
              '& .MuiInputBase-input': {
                color: '#e5e5e5',
                '&::placeholder': {
                  color: '#888',
                  opacity: 1,
                },
              },
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label="All"
              clickable
              color={filterType === 'all' ? 'primary' : 'default'}
              onClick={() => setFilterType('all')}
              sx={{ 
                color: filterType === 'all' ? 'white' : '#e5e5e5',
                backgroundColor: filterType === 'all' ? '#667eea' : '#444',
                '&:hover': {
                  backgroundColor: filterType === 'all' ? '#5a6fd8' : '#555',
                }
              }}
            />
            <Chip
              label="PDF"
              clickable
              color={filterType === 'pdf' ? 'primary' : 'default'}
              onClick={() => setFilterType('pdf')}
              sx={{ 
                color: filterType === 'pdf' ? 'white' : '#e5e5e5',
                backgroundColor: filterType === 'pdf' ? '#667eea' : '#444',
                '&:hover': {
                  backgroundColor: filterType === 'pdf' ? '#5a6fd8' : '#555',
                }
              }}
            />
            <Chip
              label="TXT"
              clickable
              color={filterType === 'text' ? 'primary' : 'default'}
              onClick={() => setFilterType('text')}
              sx={{ 
                color: filterType === 'text' ? 'white' : '#e5e5e5',
                backgroundColor: filterType === 'text' ? '#667eea' : '#444',
                '&:hover': {
                  backgroundColor: filterType === 'text' ? '#5a6fd8' : '#555',
                }
              }}
            />
            <Chip
              label="DOCX"
              clickable
              color={filterType === 'wordprocessingml' ? 'primary' : 'default'}
              onClick={() => setFilterType('wordprocessingml')}
              sx={{ 
                color: filterType === 'wordprocessingml' ? 'white' : '#e5e5e5',
                backgroundColor: filterType === 'wordprocessingml' ? '#667eea' : '#444',
                '&:hover': {
                  backgroundColor: filterType === 'wordprocessingml' ? '#5a6fd8' : '#555',
                }
              }}
            />
          </Box>
          
          <Typography variant="body2" sx={{ color: '#888', ml: 'auto' }}>
            {filteredDocuments.length} of {documents?.data?.length || 0} documents
          </Typography>
        </Box>
      </Paper>

      {/* Modern Upload Area */}
      <Paper
        elevation={0}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? '#667eea' : '#444',
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#2a2a2a' : '#1a1a1a',
          mb: 3,
          transition: 'all 0.3s ease',
          color: '#e5e5e5',
          '&:hover': {
            borderColor: '#667eea',
            backgroundColor: '#2a2a2a',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(102,126,234,0.2)',
          }
        }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ 
          fontSize: 64, 
          color: isDragActive ? '#667eea' : '#888', 
          mb: 2,
          transition: 'color 0.3s ease'
        }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
          {isDragActive ? 'Drop your files here!' : 'Upload Documents'}
        </Typography>
        <Typography variant="body1" sx={{ color: '#b0b0b0' }} gutterBottom>
          {isDragActive ? 'Release to upload' : 'Drag & drop files here or click to browse'}
        </Typography>
        <Button 
          variant="contained" 
          component="span" 
          disabled={uploadMutation.isLoading}
          sx={{ 
            mt: 2,
            borderRadius: 3,
            px: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          {uploadMutation.isLoading ? 'Uploading...' : 'Choose Files'}
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 2, color: '#888' }}>
          📄 PDF • 📝 TXT • 📋 DOCX • Max 10MB per file
        </Typography>
      </Paper>

      {/* Upload Error */}
      {uploadError && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {uploadError}
          </Alert>
        </Fade>
      )}

      {/* Documents List - Compact View */}
      <Paper sx={{ 
        borderRadius: 3, 
        overflow: 'hidden', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        backgroundColor: '#2a2a2a',
        border: '1px solid #444'
      }}>
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(to right, #3a3a3a 0%, #2a2a2a 100%)',
          borderBottom: '1px solid #444'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#e5e5e5' }}>
            📚 Your Documents ({filteredDocuments.length})
          </Typography>
        </Box>
        
        {filteredDocuments.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center', backgroundColor: '#1a1a1a' }}>
            <FileIcon sx={{ fontSize: 80, color: '#666', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#b0b0b0' }} gutterBottom>
              {searchTerm || filterType !== 'all' ? 'No documents match your search' : 'No documents yet'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>
              {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filters' : 'Upload your first document to get started with AI-powered assistance'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredDocuments.map((document: Document, index: number) => (
              <Fade in key={document.id} timeout={300 + index * 100}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 3,
                    backgroundColor: '#1a1a1a',
                    borderBottom: index < filteredDocuments.length - 1 ? '1px solid #444' : 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    }
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: getFileTypeBackgroundColor(document.content_type),
                        width: 48,
                        height: 48,
                        mr: 1
                      }}
                    >
                      {getFileIcon(document.content_type)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, color: '#e5e5e5' }}>
                          {document.original_filename}
                        </Typography>
                        {getStatusIcon(document)}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip
                            label={document.content_type.split('/')[1].toUpperCase()}
                            color={getFileTypeColor(document.content_type) as any}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                          <Chip
                            label={
                              document.processed || document.processing_status === 'completed' 
                                ? 'Ready' 
                                : document.processing_status === 'failed' 
                                ? 'Failed' 
                                : 'Processing...'
                            }
                            color={
                              document.processed || document.processing_status === 'completed'
                                ? 'success' 
                                : document.processing_status === 'failed'
                                ? 'error'
                                : 'warning'
                            }
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#888' }}>
                          ID: {document.id} • {formatFileSize(document.file_size)} • Uploaded {new Date(document.created_at).toLocaleDateString()}
                        </Typography>
                        
                        {/* Processing Progress Bar */}
                        {document.processing_status === 'processing' && (
                          <LinearProgress 
                            sx={{ 
                              mt: 1, 
                              borderRadius: 1,
                              height: 4,
                              backgroundColor: '#444',
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                              }
                            }} 
                          />
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Tooltip title="Delete Document">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(document.id)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </Fade>
            ))}
          </List>
        )}
      </Paper>

    </Box>
  );
};

export default Documents;