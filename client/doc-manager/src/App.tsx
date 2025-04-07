import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import FileVersions from './components/FileVersions';
import FileUpload from './components/FileUpload';

const App: React.FC = () => {
  const [fileId] = useState<number>(1); // For demo purposes, using a fixed file ID

  const handleUploadComplete = () => {
    // Refresh the versions list
    window.location.reload();
  };

  return (
    <AuthProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <h1 className="text-4xl font-bold">Document Manager</h1>
          <FileUpload onUploadComplete={handleUploadComplete} />
          <div className="mt-8">
            <FileVersions fileId={fileId} />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default App; 