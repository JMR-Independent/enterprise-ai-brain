import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, List, ListItem, Chip } from '@mui/material';
import { documentsApi } from '../services/api';

const Debug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkDebugInfo();
  }, []);

  const checkDebugInfo = async () => {
    const info: any = {};
    
    // Check localStorage token
    info.token = localStorage.getItem('token');
    info.hasToken = !!info.token;
    
    // Check API URL
    info.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    // Check if user is logged in
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      info.user = user;
      info.hasUser = Object.keys(user).length > 0;
    } catch {
      info.hasUser = false;
    }

    setDebugInfo(info);
  };

  const testDocumentsAPI = async () => {
    setLoading(true);
    try {
      const response = await documentsApi.getDocuments();
      console.log('Documents API Response:', response);
      setDebugInfo(prev => ({
        ...prev,
        documentsAPI: {
          success: true,
          data: response.data,
          count: response.data?.length || 0
        }
      }));
    } catch (error: any) {
      console.error('Documents API Error:', error);
      setDebugInfo(prev => ({
        ...prev,
        documentsAPI: {
          success: false,
          error: error.response?.data?.detail || error.message,
          status: error.response?.status
        }
      }));
    }
    setLoading(false);
  };

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔧 Debug Panel
      </Typography>

      {/* Debug Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Status
        </Typography>
        
        <List>
          <ListItem>
            <Typography><strong>API URL:</strong> {debugInfo.apiUrl}</Typography>
          </ListItem>
          <ListItem>
            <Typography><strong>Has Token:</strong></Typography>
            <Chip 
              label={debugInfo.hasToken ? 'YES' : 'NO'} 
              color={debugInfo.hasToken ? 'success' : 'error'} 
              sx={{ ml: 1 }}
            />
          </ListItem>
          <ListItem>
            <Typography><strong>Token Preview:</strong> {debugInfo.token ? debugInfo.token.substring(0, 20) + '...' : 'None'}</Typography>
          </ListItem>
          <ListItem>
            <Typography><strong>Has User:</strong></Typography>
            <Chip 
              label={debugInfo.hasUser ? 'YES' : 'NO'} 
              color={debugInfo.hasUser ? 'success' : 'error'} 
              sx={{ ml: 1 }}
            />
          </ListItem>
          {debugInfo.user && (
            <ListItem>
              <Typography><strong>User:</strong> {JSON.stringify(debugInfo.user, null, 2)}</Typography>
            </ListItem>
          )}
        </List>
      </Paper>

      {/* API Test */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Test
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={testDocumentsAPI}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? 'Testing...' : 'Test Documents API'}
        </Button>

        <Button 
          variant="outlined" 
          color="error"
          onClick={clearStorage}
        >
          Clear Storage
        </Button>

        {debugInfo.documentsAPI && (
          <Box sx={{ mt: 2 }}>
            {debugInfo.documentsAPI.success ? (
              <Alert severity="success">
                ✅ Documents API works! Found {debugInfo.documentsAPI.count} documents
                <pre>{JSON.stringify(debugInfo.documentsAPI.data, null, 2)}</pre>
              </Alert>
            ) : (
              <Alert severity="error">
                ❌ Documents API failed: {debugInfo.documentsAPI.error} (Status: {debugInfo.documentsAPI.status})
              </Alert>
            )}
          </Box>
        )}
      </Paper>

      {/* Instructions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🔍 Instructions
        </Typography>
        <Typography variant="body1">
          1. Check if you have a valid token<br/>
          2. Test the Documents API<br/>
          3. If the API fails with 401, you need to login again<br/>
          4. If the API works but shows 0 documents, check the backend database
        </Typography>
      </Paper>
    </Box>
  );
};

export default Debug;