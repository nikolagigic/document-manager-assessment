import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Button, 
  TextField, 
  Typography, 
  Box,
  Alert,
  CircularProgress
} from '@mui/material';

const FileUpload: React.FC = () => {
  const { getAuthHeader } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    try {
      const response = await fetch('/api/file-versions/', {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to upload file');
      }

      setSuccess(true);
      setFile(null);
      setDescription('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="space-y-4">
      <Typography variant="h5" className="mb-4">
        Upload New File Version
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" className="mb-4">
          File uploaded successfully!
        </Alert>
      )}

      <TextField
        type="file"
        onChange={handleFileChange}
        fullWidth
        className="mb-4"
      />

      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={3}
        className="mb-4"
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={uploading || !file}
      >
        {uploading ? <CircularProgress size={24} /> : 'Upload'}
      </Button>
    </Box>
  );
};

export default FileUpload; 