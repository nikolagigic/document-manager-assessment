import React, { useState } from 'react';
import './FileUpload.css';

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('content', file);
    formData.append('file_name', file.name);

    try {
      const response = await fetch('http://localhost:8001/api/files/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const data = await response.json();
      setFile(null);
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
        <div className="file-input">
          <input
            type="file"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading || !file}>
          {loading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>
    </div>
  );
}

export default FileUpload; 