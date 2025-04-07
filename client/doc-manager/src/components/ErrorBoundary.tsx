import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Container, Typography } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" className="py-8">
          <Alert severity="error" className="mb-4">
            <Typography variant="h5" component="h2" className="mb-2">
              Something went wrong
            </Typography>
            <Typography variant="body1" className="mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
              className="mt-4"
            >
              Try Again
            </Button>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 