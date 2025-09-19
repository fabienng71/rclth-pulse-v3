
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('=== ERROR BOUNDARY: Error caught ===', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('=== ERROR BOUNDARY: Component error details ===', {
      error: error.toString(),
      errorInfo,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      console.log('=== ERROR BOUNDARY: Rendering error UI ===');
      
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50 p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-destructive">Application Error</CardTitle>
              <CardDescription>
                The application encountered an unexpected error and needs to be reloaded.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded text-sm">
                  <strong>Error:</strong> {this.state.error?.message || "Unknown error"}
                </div>
                
                {this.state.error?.stack && (
                  <details className="bg-gray-100 p-4 rounded text-xs">
                    <summary className="cursor-pointer font-medium">Technical Details</summary>
                    <pre className="mt-2 overflow-auto max-h-48">{this.state.error.stack}</pre>
                  </details>
                )}
                
                <div className="text-sm text-gray-600">
                  Try refreshing the page. If the problem persists, try:
                  <ul className="list-disc list-inside mt-2 ml-2">
                    <li>Clearing your browser cache</li>
                    <li>Using an incognito/private window</li>
                    <li>Checking your internet connection</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('=== ERROR BOUNDARY: Clearing data and restarting ===');
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/';
                }}
              >
                Clear Data & Restart
              </Button>
              <Button 
                onClick={() => {
                  console.log('=== ERROR BOUNDARY: Reloading page ===');
                  window.location.reload();
                }}
              >
                Reload Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
