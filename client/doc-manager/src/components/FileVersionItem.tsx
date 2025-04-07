import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileVersionItemProps, User } from '../types';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Checkbox } from './ui/checkbox';

const FileVersionItem: React.FC<FileVersionItemProps> = ({ version, onDelete, onPermissionsChange }) => {
  const [openPermissions, setOpenPermissions] = useState(false);
  const [selectedReadUsers, setSelectedReadUsers] = useState<number[]>([]);
  const [selectedWriteUsers, setSelectedWriteUsers] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { user, getAuthHeader } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/versions/available_users/', {
          headers: getAuthHeader(),
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (openPermissions) {
      fetchUsers();
    }
  }, [openPermissions, getAuthHeader]);

  useEffect(() => {
    if (version) {
      setSelectedReadUsers(version.can_read.map(user => user.id));
      setSelectedWriteUsers(version.can_write.map(user => user.id));
    }
  }, [version]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this version?')) {
      onDelete(version.id);
    }
  };

  const handlePermissionChange = (userId: number, permissionType: 'read' | 'write') => {
    if (permissionType === 'read') {
      setSelectedReadUsers(prev =>
        prev.includes(userId)
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    } else {
      setSelectedWriteUsers(prev =>
        prev.includes(userId)
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleSavePermissions = () => {
    onPermissionsChange(version.id, selectedReadUsers, selectedWriteUsers);
    setOpenPermissions(false);
  };

  const availableUsers = users.filter(user => user.id !== version.file_owner.id);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg mb-2">
      <div>
        <h3 className="text-lg font-semibold">Version {version.version_number}</h3>
        <p className="text-sm text-muted-foreground">
          Created: {new Date(version.created_at).toLocaleString()}
        </p>
      </div>
      <div className="flex gap-2">
        {user?.id === version.file_owner.id && (
          <Button
            variant="default"
            onClick={() => setOpenPermissions(true)}
          >
            Manage Permissions
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </div>

      <Dialog open={openPermissions} onOpenChange={setOpenPermissions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {availableUsers.map(user => (
              <div key={user.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`read-${user.id}`}
                    checked={selectedReadUsers.includes(user.id)}
                    onCheckedChange={() => handlePermissionChange(user.id, 'read')}
                  />
                  <label
                    htmlFor={`read-${user.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {user.username} (Can Read)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`write-${user.id}`}
                    checked={selectedWriteUsers.includes(user.id)}
                    onCheckedChange={() => handlePermissionChange(user.id, 'write')}
                  />
                  <label
                    htmlFor={`write-${user.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {user.username} (Can Write)
                  </label>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPermissions(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileVersionItem; 