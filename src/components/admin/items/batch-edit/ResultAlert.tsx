import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ResultAlertProps {
  result: { success: boolean; message: string } | null;
}

export const ResultAlert: React.FC<ResultAlertProps> = ({ result }) => {
  if (!result) return null;

  return (
    <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
      {result.success ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-600" />
      )}
      <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
        {result.message}
      </AlertDescription>
    </Alert>
  );
};