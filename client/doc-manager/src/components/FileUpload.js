import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './FileUpload.css';

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [urlPath, setUrlPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    // Set a default URL path based on the file name
    if (selectedFile) {
      setUrlPath(`/${selectedFile.name}`);
    }
    setError(null);
  };

  const handleUrlPathChange = (event) => {
    setUrlPath(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    if (!urlPath) {
      setError('Please enter a URL path');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('content', file);
    formData.append('file_name', file.name);
    formData.append('url_path', urlPath);
    formData.append('content_type', file.type || 'application/octet-stream');

    try {
      const response = await fetch('http://localhost:8001/api/files/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const data = await response.json();
      setFile(null);
      setUrlPath('');
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload">
      <h2>Upload New File</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="file">File:</label>
          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="urlPath">URL Path:</label>
          <input
            id="urlPath"
            type="text"
            value={urlPath}
            onChange={handleUrlPathChange}
            placeholder="/path/to/file"
            disabled={loading}
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading || !file || !urlPath}>
          {loading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>
    </div>
  );
}

export default FileUpload; 