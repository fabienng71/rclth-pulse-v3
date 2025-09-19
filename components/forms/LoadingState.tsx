
import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading data...' 
}) => {
  return (
    <div className="container py-10 flex justify-center items-center">
      <div className="text-center">
        <div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center">
          <div className="text-2xl text-primary">⏳</div>
        </div>
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
