import React, { useState, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import FileUpload from "./components/FileUpload";
import "./FileVersions.css";

function FileVersionItem({ version }) {
  return (
    <div className="file-version-item">
      <div className="version-header">
        <h3>{version.file_name}</h3>
        <span className="version-number">v{version.version_number}</span>
      </div>
      <div className="version-details">
        <p>Created: {new Date(version.created_at).toLocaleString()}</p>
        <p>Hash: {version.content_hash}</p>
      </div>
    </div>
  );
}

function FileVersionsList({ versions }) {
  return (
    <div className="file-versions-list">
      {versions.map((version) => (
        <FileVersionItem
          key={version.id}
          version={version}
        />
      ))}
    </div>
  );
}

function FileVersions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8001/api/versions/", {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }
      const data = await response.json();
      setData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVersions();
    }
  }, [token]);

  const handleUploadSuccess = () => {
    fetchVersions();
  };

  if (loading) {
    return <div className="loading">Loading versions...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="file-versions-container">
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      
      <div className="versions-section">
        <h2>File Versions</h2>
        {data.length === 0 ? (
          <p>No versions found. Upload a file to get started.</p>
        ) : (
          <FileVersionsList versions={data} />
        )}
      </div>
    </div>
  );
}

export default FileVersions;
