
import { useEffect } from 'react';

interface UploadProgressProps {
  current: number;
  total: number;
  isUploading: boolean;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ 
  current, 
  total, 
  isUploading 
}) => {
  // Only show when uploading is in progress and we have a positive total
  if (!isUploading || total <= 0) {
    return null;
  }
  
  const percent = Math.round((current / total) * 100);
  
  return (
    <div className="mt-2">
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-2 bg-blue-500 transition-all duration-300" 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <p className="text-xs text-center mt-1">
        📤 Uploading: {percent}%
      </p>
    </div>
  );
};
