
import React from 'react';
import { Button } from '@/components/ui/button';

interface DashboardErrorBoundaryProps {
  error: Error;
}

export const DashboardErrorBoundary = ({ error }: DashboardErrorBoundaryProps) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Dashboard Error</h2>
        <p className="mb-4 text-red-600">{error.message}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="destructive"
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
};
