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
  CircularProgress
} from '@mui/material';

interface FileVersionItemProps {
  version: FileVersion;
  onDelete: (versionId: number) => void;
  users: User[];
}

const FileVersionItem: React.FC<FileVersionItemProps> = ({ version, onDelete, users }) => {
  const { user, getAuthHeader } = useAuth();
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const isOwner = useMemo(() => 
    user?.id === version.file_owner.id,
    [user?.id, version.file_owner.id]
  );

  return (
    <Card className="mb-4">
      <CardContent>
        <Typography variant="h6">Version {version.version_number}</Typography>
        <Typography color="textSecondary">
          Uploaded by: {version.file_owner.username}
        </Typography>
        <Typography color="textSecondary">
          Uploaded at: {new Date(version.uploaded_at).toLocaleString()}
        </Typography>
        {error && (
          <Typography color="error" className="mt-2">
            {error}
          </Typography>
        )}
        <div className="mt-4">
          {isOwner && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setPermissionsOpen(true)}
              className="mr-2"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Manage Permissions'}
            </Button>
          )}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Version'}
          </Button>
        </div>
      </CardContent>

      <Dialog 
        open={permissionsOpen} 
        onClose={() => !isSaving && setPermissionsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Permissions</DialogTitle>
        <DialogContent>
          <FormGroup>
            <Typography variant="subtitle1" className="mb-2">Can Read</Typography>
            <List>
              {availableUsers.map(user => (
                <ListItem key={user.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedUsers[user.id] || false}
                        onChange={() => handlePermissionChange(user.id.toString())}
                        disabled={isSaving}
                      />
                    }
                    label={<ListItemText primary={user.username} />}
                  />
                </ListItem>
              ))}
            </List>
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPermissionsOpen(false)} 
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSavePermissions} 
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <CircularProgress size={20} className="mr-2" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FileVersionItem; 