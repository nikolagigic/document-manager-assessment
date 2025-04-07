import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileVersion, User } from '../types';
import FileVersionItem from './FileVersionItem';
import { 
  Typography, 
  CircularProgress, 
  Alert,
  Container
} from '@mui/material';

const FileVersions: React.FC = () => {
  const { getAuthHeader } = useAuth();
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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
      } catch (error) {
        setError('Failed to load versions');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAuthHeader]);

  const handleDelete = (versionId: number) => {
    setVersions(prevVersions => prevVersions.filter(v => v.id !== versionId));
  };

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
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" className="mb-6">
        File Versions
      </Typography>
      {versions.length === 0 ? (
        <Typography>No versions available.</Typography>
      ) : (
        versions.map(version => (
          <FileVersionItem
            key={version.id}
            version={version}
            onDelete={handleDelete}
            users={users}
          />
        ))
      )}
    </Container>
  );
};

export default FileVersions; 