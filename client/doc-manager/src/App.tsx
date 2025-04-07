import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import FileUpload from './components/FileUpload';
import FileVersions from './components/FileVersions';
import { Container, Typography, Box } from '@mui/material';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Container maxWidth="lg">
        <Box className="py-8">
          <Typography variant="h3" component="h1" className="mb-8">
            Document Manager
          </Typography>
          <Box className="space-y-8">
            <FileUpload />
            <FileVersions />
          </Box>
        </Box>
      </Container>
    </AuthProvider>
  );
};

export default App; 