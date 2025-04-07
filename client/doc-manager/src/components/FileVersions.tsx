import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FileVersionItem from './FileVersionItem';
import { FileVersionsProps, FileVersion } from '../types';

const FileVersions: React.FC<FileVersionsProps> = ({ fileId }) => {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeader } = useAuth();

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/versions/?file=${fileId}`, {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      } else {
        setError('Failed to fetch versions');
      }
    } catch (error) {
      setError('Error fetching versions');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [fileId, getAuthHeader]);

  const handleDelete = async (versionId: number) => {
    try {
      const response = await fetch(`/api/versions/${versionId}/`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (response.ok) {
        setVersions(versions.filter(v => v.id !== versionId));
      } else {
        setError('Failed to delete version');
      }
    } catch (error) {
      setError('Error deleting version');
      console.error('Error:', error);
    }
  };

  const handlePermissionsChange = async (versionId: number, canRead: number[], canWrite: number[]) => {
    try {
      const response = await fetch(`/api/versions/${versionId}/set_permissions/`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          can_read: canRead,
          can_write: canWrite,
        }),
      });
      if (response.ok) {
        const updatedVersion = await response.json();
        setVersions(versions.map(v => v.id === versionId ? updatedVersion : v));
      } else {
        setError('Failed to update permissions');
      }
    } catch (error) {
      setError('Error updating permissions');
      console.error('Error:', error);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">File Versions</h2>
      <div className="space-y-2">
        {versions.map(version => (
          <FileVersionItem
            key={version.id}
            version={version}
            onDelete={handleDelete}
            onPermissionsChange={handlePermissionsChange}
          />
        ))}
      </div>
    </div>
  );
};

export default FileVersions; 