import React, { Suspense } from 'react';
import { Container, Typography, CircularProgress, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components
const FileUpload = React.lazy(() => import('./components/FileUpload'));
const FileVersions = React.lazy(() => import('./components/FileVersions'));

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Container maxWidth="lg" className="mx-auto px-4 py-8">
          <Typography variant="h4" component="h1" className="mb-8 text-center">
            Document Manager
          </Typography>
          
          <Suspense fallback={<LoadingFallback />}>
            <FileUpload />
            <Box className="mt-8">
              <FileVersions />
            </Box>
          </Suspense>
        </Container>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App; 