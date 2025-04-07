import React, { useState, useEffect } from 'react';
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
  ListItemText
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

  // Filter out the file owner from the users list
  const availableUsers = users.filter(user => user.id !== version.file_owner.id);

  useEffect(() => {
    if (permissionsOpen) {
      // Initialize permissions when dialog opens
      const initialPermissions: { [key: string]: boolean } = {};
      availableUsers.forEach(user => {
        initialPermissions[user.id] = version.can_read.some(u => u.id === user.id);
      });
      setSelectedUsers(initialPermissions);
    }
  }, [permissionsOpen, version, availableUsers]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this version?')) {
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
      }
    }
  };

  const handlePermissionChange = (userId: string) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleSavePermissions = async () => {
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
    }
  };

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
          {user?.id === version.file_owner.id && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setPermissionsOpen(true)}
              className="mr-2"
            >
              Manage Permissions
            </Button>
          )}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDelete}
          >
            Delete Version
          </Button>
        </div>
      </CardContent>

      <Dialog open={permissionsOpen} onClose={() => setPermissionsOpen(false)}>
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
          <Button onClick={() => setPermissionsOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePermissions} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FileVersionItem; 