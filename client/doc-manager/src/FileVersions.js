import React, { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import "./FileVersions.css";

function FileVersionItem({ version, onCompare }) {
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
      <div className="version-actions">
        <button onClick={() => onCompare(version)}>Compare</button>
      </div>
    </div>
  );
}

function FileVersionsList({ versions, onCompare }) {
  return (
    <div className="file-versions-list">
      {versions.map((version) => (
        <FileVersionItem
          key={version.id}
          version={version}
          onCompare={onCompare}
        />
      ))}
    </div>
  );
}

function FileVersions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState([]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8001/api/versions/");
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
    fetchVersions();
  }, []);

  const handleUploadSuccess = () => {
    fetchVersions();
  };

  const handleCompare = (version) => {
    if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, version]);
    } else {
      setSelectedVersions([version]);
    }
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
          <FileVersionsList versions={data} onCompare={handleCompare} />
        )}
      </div>

      {selectedVersions.length === 2 && (
        <div className="comparison-section">
          <h3>Version Comparison</h3>
          <div className="comparison-content">
            <div className="version-diff">
              <h4>Version {selectedVersions[0].version_number}</h4>
              <pre>{selectedVersions[0].content}</pre>
            </div>
            <div className="version-diff">
              <h4>Version {selectedVersions[1].version_number}</h4>
              <pre>{selectedVersions[1].content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileVersions;
