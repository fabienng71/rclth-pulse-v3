
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstagramScreenshotUpload } from './InstagramScreenshotUpload';
import { UseFormReturn } from 'react-hook-form';
import { LeadFormValues } from '@/hooks/useLeadForm';
import { Upload, Image, FileText } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LeadUploadSectionProps {
  form: UseFormReturn<LeadFormValues>;
  uploadMode: boolean;
  onUploadComplete: (fileUrl: string) => void;
}

export const LeadUploadSection: React.FC<LeadUploadSectionProps> = ({
  form,
  uploadMode,
  onUploadComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUploadComplete = async (fileUrl: string) => {
    setIsProcessing(true);
    try {
      await onUploadComplete(fileUrl);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Lead Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <Image className="h-4 w-4" />
            <AlertDescription>
              Upload a screenshot of Instagram profile, business card, or any document containing contact information. 
              Our AI will automatically extract and fill the form fields for you.
            </AlertDescription>
          </Alert>
          
          <InstagramScreenshotUpload 
            form={form} 
            onUploadComplete={handleUploadComplete}
            isProcessing={isProcessing}
          />
          
          {isProcessing && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Processing your upload and extracting information... This may take a few seconds.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
