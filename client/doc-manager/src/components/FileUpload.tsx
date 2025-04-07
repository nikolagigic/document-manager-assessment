import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileUploadProps } from '../types';
import { Button } from './ui/button';

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeader } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/versions/', {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });

      if (response.ok) {
        onUploadComplete();
      } else {
        setError('Failed to upload file');
      }
    } catch (error) {
      setError('Error uploading file');
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
      <Button
        variant="default"
        asChild
      >
        <label className="cursor-pointer">
          Upload New Version
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </Button>
    </div>
  );
};

export default FileUpload; 