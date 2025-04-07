import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileVersion, User } from '../types';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';

interface FileVersionItemProps {
  version: FileVersion;
  onDelete: (id: number) => void;
  users: User[];
}

const FileVersionItem: React.FC<FileVersionItemProps> = ({ version, onDelete, users }) => {
  const { user, getAuthHeader } = useAuth();
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<FileVersion | null>(null);

  // Filter out the file owner from the users list
  const availableUsers = useMemo(() => 
    users.filter(user => user.id !== version.file_owner.id),
    [users, version.file_owner.id]
  );

  // Initialize permissions when dialog opens
  useEffect(() => {
    if (permissionsOpen) {
      const initialPermissions: { [key: string]: boolean } = {};
      availableUsers.forEach(user => {
        initialPermissions[user.id] = version.can_read.some(u => u.id === user.id);
      });
      setSelectedUsers(initialPermissions);
    }
  }, [permissionsOpen, version.can_read, availableUsers]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this version?')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/file-versions/${version.id}/`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete version');
      }

      onDelete(version.id);
    } catch (error) {
      setError('Failed to delete version');
      console.error('Error deleting version:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [version.id, getAuthHeader, onDelete]);

  const handlePermissionChange = useCallback((userId: string) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  }, []);

  const handleSavePermissions = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const readUsers = Object.entries(selectedUsers)
        .filter(([_, isSelected]) => isSelected)
        .map(([userId]) => parseInt(userId));

      const response = await fetch(`/api/file-versions/${version.id}/set_permissions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          can_read: readUsers,
          can_write: readUsers, // For now, write permissions are the same as read
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update permissions');
      }

      setPermissionsOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update permissions');
      console.error('Error updating permissions:', error);
    } finally {
      setIsSaving(false);
    }
  }, [version.id, selectedUsers, getAuthHeader]);

  const handleGetVersion = useCallback(async (revision?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(`/api/files/${version.file}/get_version/`, window.location.origin);
      if (revision !== undefined) {
        url.searchParams.append('revision', revision.toString());
      }

      const response = await fetch(url.toString(), {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch version');
      }

      const data = await response.json();
      setCurrentVersion(data);
    } catch (error) {
      setError('Failed to fetch version');
      console.error('Error fetching version:', error);
    } finally {
      setIsLoading(false);
    }
  }, [version.file, getAuthHeader]);

  const isOwner = useMemo(() => 
    user?.id === version.file_owner.id,
    [user?.id, version.file_owner.id]
  );

  return (
    <Box className="p-4 border rounded-lg shadow-sm">
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h6">
          Version {version.version_number}
        </Typography>
        <Box>
          {isOwner && (
            <Button
              variant="outlined"
              onClick={() => setPermissionsOpen(true)}
              className="mr-2"
            >
              Manage Permissions
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Box>
      </Box>

      <Box className="space-y-2">
        <Typography>
          <strong>File Name:</strong> {version.file_name}
        </Typography>
        <Typography>
          <strong>Created:</strong> {new Date(version.created_at).toLocaleString()}
        </Typography>
        <Typography>
          <strong>Content Hash:</strong> {version.content_hash}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mt-4">
          {error}
        </Alert>
      )}

      <Dialog
        open={permissionsOpen}
        onClose={() => setPermissionsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Permissions</DialogTitle>
        <DialogContent>
          <FormGroup>
            {availableUsers.map(user => (
              <FormControlLabel
                key={user.id}
                control={
                  <Checkbox
                    checked={selectedUsers[user.id] || false}
                    onChange={() => handlePermissionChange(user.id.toString())}
                  />
                }
                label={user.username || user.email}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionsOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSavePermissions}
            disabled={isSaving}
            color="primary"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {isLoading ? (
        <Box className="flex justify-center items-center p-4">
          <CircularProgress />
        </Box>
      ) : currentVersion ? (
        <Box className="mt-4 p-4 border rounded">
          <Typography variant="h6">Version Details</Typography>
          <Typography>
            <strong>Version Number:</strong> {currentVersion.version_number}
          </Typography>
          <Typography>
            <strong>Created:</strong> {new Date(currentVersion.created_at).toLocaleString()}
          </Typography>
          <Typography>
            <strong>Content Hash:</strong> {currentVersion.content_hash}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
};

export default FileVersionItem; 