import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { enterpriseApi } from '@/services/api';
import toast from 'react-hot-toast';

interface SystemInfo {
  system: string;
  version: string;
  environment: string;
  features: {
    advanced_rag: boolean;
    financial_analysis: boolean;
    enterprise_docs: boolean;
    analytics: boolean;
  };
}

interface QueryResponse {
  query_id: number;
  response: string;
  query_type: string;
  complexity: string;
  processing_time_ms: number;
  status: string;
}

const Enterprise: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [query, setQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);

  useEffect(() => {
    loadSystemInfo();
    checkHealth();
    checkDatabase();
  }, []);

  const loadSystemInfo = async () => {
    try {
      const response = await enterpriseApi.getSystemInfo();
      setSystemInfo(response.data);
    } catch (error) {
      toast.error('Error loading system info');
    }
  };

  const checkHealth = async () => {
    try {
      const response = await enterpriseApi.testHealth();
      setHealthStatus(response.data);
    } catch (error) {
      toast.error('Health check failed');
    }
  };

  const checkDatabase = async () => {
    try {
      const response = await enterpriseApi.testDatabase();
      setDbStatus(response.data);
    } catch (error) {
      console.log('Database check failed:', error);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setLoading(true);
    try {
      const response = await enterpriseApi.simpleQuery(query);
      setQueryResponse(response.data);
      toast.success('Query processed successfully');
    } catch (error) {
      toast.error('Error processing query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enterprise AI Brain
        </h1>
        <p className="text-lg text-gray-600">
          Advanced Business Intelligence System
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Info</h3>
          {systemInfo ? (
            <div className="space-y-2">
              <p><strong>System:</strong> {systemInfo.system}</p>
              <p><strong>Version:</strong> {systemInfo.version}</p>
              <p><strong>Environment:</strong> {systemInfo.environment}</p>
              <div className="mt-4">
                <p className="font-semibold mb-2">Features:</p>
                <ul className="text-sm space-y-1">
                  <li>✅ Advanced RAG: {systemInfo.features.advanced_rag ? 'Enabled' : 'Disabled'}</li>
                  <li>✅ Financial Analysis: {systemInfo.features.financial_analysis ? 'Enabled' : 'Disabled'}</li>
                  <li>✅ Enterprise Docs: {systemInfo.features.enterprise_docs ? 'Enabled' : 'Disabled'}</li>
                  <li>✅ Analytics: {systemInfo.features.analytics ? 'Enabled' : 'Disabled'}</li>
                </ul>
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Health Status</h3>
          {healthStatus ? (
            <div className="space-y-2">
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  healthStatus.status === 'healthy' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {healthStatus.status}
                </span>
              </p>
              <p><strong>Service:</strong> {healthStatus.service}</p>
            </div>
          ) : (
            <p>Checking...</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Database Status</h3>
          {dbStatus ? (
            <div className="space-y-2">
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  dbStatus.status === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dbStatus.database}
                </span>
              </p>
              {dbStatus.test_result && (
                <p><strong>Test Result:</strong> {dbStatus.test_result}</p>
              )}
              {dbStatus.error && (
                <p className="text-red-600 text-sm"><strong>Error:</strong> {dbStatus.error}</p>
              )}
            </div>
          ) : (
            <p>Checking...</p>
          )}
        </Card>
      </div>

      {/* Query Interface */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Enterprise Query System</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Intelligence Query
            </label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., balance general del año 2010 de julio donde aparecen estos nombres"
              className="w-full"
            />
          </div>
          <Button 
            onClick={handleQuery} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Process Query'}
          </Button>
        </div>
      </Card>

      {/* Query Response */}
      {queryResponse && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Query Response</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Query ID:</strong> {queryResponse.query_id}
              </div>
              <div>
                <strong>Type:</strong> {queryResponse.query_type}
              </div>
              <div>
                <strong>Complexity:</strong> {queryResponse.complexity}
              </div>
              <div>
                <strong>Processing Time:</strong> {queryResponse.processing_time_ms}ms
              </div>
            </div>
            <div className="border-t pt-4">
              <strong className="block mb-2">Response:</strong>
              <p className="bg-gray-50 p-4 rounded-lg">
                {queryResponse.response}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Enterprise;