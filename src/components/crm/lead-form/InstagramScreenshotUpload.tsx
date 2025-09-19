
import React, { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LeadFormValues } from '@/hooks/useLeadForm';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, X, FileText, Camera } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface InstagramScreenshotUploadProps {
  form: UseFormReturn<LeadFormValues>;
  onUploadComplete: (fileUrl: string) => void;
  isProcessing?: boolean;
}

export const InstagramScreenshotUpload: React.FC<InstagramScreenshotUploadProps> = ({
  form,
  onUploadComplete,
  isProcessing = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, JPEG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `lead-screenshots/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      form.setValue('screenshot_url', publicUrl);
      onUploadComplete(publicUrl);

      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully. Processing information...",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive"
      });
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [form, onUploadComplete, toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const clearPreview = () => {
    setPreview(null);
    form.setValue('screenshot_url', '');
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <Card className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img 
                src={preview} 
                alt="Uploaded screenshot" 
                className="w-24 h-24 object-cover rounded-lg border"
              />
              {!isProcessing && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={clearPreview}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Image className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Image uploaded successfully</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isProcessing ? "Processing and extracting information..." : "Information extracted and form fields populated"}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Upload Document</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop an image here, or click to browse
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  Screenshots
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Business Cards
                </span>
                <span className="flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  Social Profiles
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={uploading || isProcessing}
                onClick={() => document.getElementById('instagram-screenshot-upload')?.click()}
                className="mx-auto"
              >
                {uploading ? "Uploading..." : "Choose File"}
              </Button>
              
              <Input
                id="instagram-screenshot-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                disabled={uploading || isProcessing}
              />
              
              <p className="text-xs text-muted-foreground">
                Supports PNG, JPG, JPEG (max 10MB)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
