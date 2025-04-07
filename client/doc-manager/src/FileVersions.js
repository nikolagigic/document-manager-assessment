import React, { useState, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import FileUpload from "./components/FileUpload";
import "./FileVersions.css";

const FileVersionItem = ({ version, onDelete, users }) => {
  const { getAuthHeader, user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState({
    canRead: new Set(),
    canWrite: new Set()
  });

  // Debug logging
  console.log('Version data:', version);
  console.log('File owner:', version?.file_owner);
  console.log('Current user:', user);
  console.log('Is owner?', version?.file_owner?.id === user?.id);
  console.log('File owner ID type:', typeof version?.file_owner?.id);
  console.log('User ID type:', typeof user?.id);
  console.log('Raw comparison:', version?.file_owner?.id, user?.id);

  // Initialize permissions when the dialog is opened
  useEffect(() => {
    if (showPermissionsDialog && version?.can_read && version?.can_write) {
      // Extract user IDs from the can_read and can_write arrays
      const canReadIds = new Set(version.can_read.map(user => user.id));
      const canWriteIds = new Set(version.can_write.map(user => user.id));
      
      setSelectedUsers({
        canRead: canReadIds,
        canWrite: canWriteIds
      });
    }
  }, [showPermissionsDialog, version]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this version?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:8001/api/versions/${version.content_hash}/`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        onDelete(version.id);
      } else {
        const data = await response.json();
        alert(data.detail || 'Failed to delete version');
      }
    } catch (error) {
      console.error('Error deleting version:', error);
      alert('Failed to delete version');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePermissionChange = (userId, permissionType, checked) => {
    setSelectedUsers(prev => {
      const newSelected = { ...prev };
      if (checked) {
        newSelected[permissionType].add(userId);
      } else {
        newSelected[permissionType].delete(userId);
      }
      return newSelected;
    });
  };

  const handleSavePermissions = async () => {
    try {
      const response = await fetch(`http://localhost:8001/api/versions/${version.content_hash}/set_permissions/`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          can_read: Array.from(selectedUsers.canRead).map(id => parseInt(id, 10)),
          can_write: Array.from(selectedUsers.canWrite).map(id => parseInt(id, 10))
        })
      });

      if (response.ok) {
        setShowPermissionsDialog(false);
        // Refresh the page to show updated permissions
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.detail || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Failed to update permissions');
    }
  };

  // Filter out the file owner from the users list
  const availableUsers = users.filter(user => user.id !== version?.file_owner?.id);

  // If we don't have the necessary data, show a loading state
  if (!version || !version.file_owner) {
    return <div className="version-item">Loading...</div>;
  }

  const isOwner = String(version.file_owner.id) === String(user?.id);

  return (
    <div className="version-item">
      <div className="version-header">
        <h3>Version {version.version_number}</h3>
        <div className="version-actions">
          {isOwner && (
            <button 
              className="permissions-button"
              onClick={() => setShowPermissionsDialog(true)}
            >
              Manage Permissions
            </button>
          )}
          <button 
            className="delete-button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      
      <div className="version-details">
        <p><strong>File Name:</strong> {version.file_name}</p>
        <p><strong>Created:</strong> {new Date(version.created_at).toLocaleString()}</p>
        <p><strong>Content Hash:</strong> {version.content_hash}</p>
      </div>

      {showPermissionsDialog && (
        <div className="permissions-dialog">
          <div className="permissions-content">
            <h3>Set Permissions</h3>
            <div className="users-list">
              {availableUsers.map(user => (
                <div key={user.id} className="user-permissions">
                  <span>{user.username}</span>
                  <div className="permission-checkboxes">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedUsers.canRead.has(user.id)}
                        onChange={(e) => handlePermissionChange(user.id, 'canRead', e.target.checked)}
                      />
                      Can Read
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedUsers.canWrite.has(user.id)}
                        onChange={(e) => handlePermissionChange(user.id, 'canWrite', e.target.checked)}
                      />
                      Can Write
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="dialog-actions">
              <button onClick={() => setShowPermissionsDialog(false)}>Cancel</button>
              <button onClick={handleSavePermissions}>Save Permissions</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function FileVersions() {
  const [versions, setVersions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeader } = useAuth();

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8001/api/versions/", {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }
      const data = await response.json();
      setVersions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8001/api/versions/available_users/", {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchVersions();
    fetchUsers();
  }, []);

  const handleDelete = (versionId) => {
    setVersions(versions.filter(v => v.id !== versionId));
  };

  if (loading) {
    return <div className="loading">Loading versions...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="file-versions-container">
      <FileUpload onUploadSuccess={fetchVersions} />
      
      <div className="versions-section">
        <h2>File Versions</h2>
        {versions.length === 0 ? (
          <p>No versions found. Upload a file to get started.</p>
        ) : (
          <div className="versions-list">
            {versions.map(version => (
              <FileVersionItem
                key={version.id}
                version={version}
                onDelete={handleDelete}
                users={users}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileVersions;
