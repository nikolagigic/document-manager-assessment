import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileVersion, User } from '../types';
import FileVersionItem from './FileVersionItem';
import { 
  Typography, 
  CircularProgress, 
  Alert,
  Container,
  Box,
  Button
} from '@mui/material';

const FileVersions: React.FC = () => {
  const { getAuthHeader } = useAuth();
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [versionsResponse, usersResponse] = await Promise.all([
        fetch('/api/file-versions/', {
          headers: getAuthHeader(),
        }),
        fetch('/api/users/', {
          headers: getAuthHeader(),
        }),
      ]);

      if (!versionsResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [versionsData, usersData] = await Promise.all([
        versionsResponse.json(),
        usersResponse.json(),
      ]);

      setVersions(versionsData);
      setUsers(usersData);
      setError(null);
    } catch (error) {
      setError('Failed to load versions');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback((versionId: number) => {
    setVersions(prevVersions => prevVersions.filter(v => v.id !== versionId));
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Container className="flex justify-center items-center h-64">
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4">
          File Versions
        </Typography>
        <Button
          variant="outlined"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <CircularProgress size={20} className="mr-2" />
              Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </Box>

      {versions.length === 0 ? (
        <Alert severity="info">
          No versions available. Upload a file to get started.
        </Alert>
      ) : (
        <Box className="space-y-4">
          {versions.map(version => (
            <FileVersionItem
              key={version.id}
              version={version}
              onDelete={handleDelete}
              users={users}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default FileVersions; 