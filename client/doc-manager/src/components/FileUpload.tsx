import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Button, 
  TextField, 
  Typography, 
  Box,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';

const FileUpload: React.FC = () => {
  const { getAuthHeader } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setFile(null);
    setDescription('');
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  }, []);

  const validateForm = useCallback(() => {
    if (!file) {
      setError('Please select a file');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return false;
    }
    return true;
  }, [file]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file!);
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
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [file, description, getAuthHeader, validateForm, resetForm]);

  return (
    <Paper elevation={2} className="p-6">
      <Typography variant="h5" component="h2" className="mb-4">
        Upload New File
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box className="space-y-4">
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                disabled={uploading}
                className="w-full"
              >
                {file ? file.name : 'Select File'}
              </Button>
            </label>
          </div>

          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
            multiline
            rows={3}
          />

          {error && (
            <Alert severity="error" className="mt-2">
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" className="mt-2">
              File uploaded successfully!
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <CircularProgress size={20} className="mr-2" />
                Uploading...
              </>
            ) : (
              'Upload File'
            )}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default FileUpload; 