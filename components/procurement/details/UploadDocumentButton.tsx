
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface UploadDocumentButtonProps {
  shipmentId: string;
  onDocumentUploaded?: () => void;
}

const UploadDocumentButton: React.FC<UploadDocumentButtonProps> = ({ 
  shipmentId, 
  onDocumentUploaded 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF or image files.');
      return;
    }

    try {
      setIsUploading(true);
      const toastId = toast.loading('Uploading document...');

      // Generate a unique filename to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${shipmentId}/${fileName}`;

      console.log('Uploading to path:', filePath, 'for shipmentId:', shipmentId);

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('shipment-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        toast.error(`Upload failed: ${uploadError.message}`, { id: toastId });
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('shipment-documents')
        .getPublicUrl(filePath);

      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting current user:', userError);
        toast.error(`Authentication error: ${userError.message}`, { id: toastId });
        throw userError;
      }
      
      const userId = userData?.user?.id;
      
      if (!userId) {
        toast.error('Unable to determine current user', { id: toastId });
        throw new Error('Unable to determine current user');
      }

      console.log('Inserting document record with shipment_id:', shipmentId);

      // Save document metadata to documents table
      const { data: docData, error: dbError } = await supabase
        .from('documents')
        .insert({
          file_name: file.name,
          file_path: publicUrl,
          file_type: file.type,
          shipment_id: shipmentId,
          uploaded_by: userId
        })
        .select();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // If database insert fails, try to clean up the storage file
        await supabase.storage.from('shipment-documents').remove([filePath]);
        toast.error(`Failed to save document metadata: ${dbError.message}`, { id: toastId });
        throw dbError;
      }

      console.log('Document metadata saved successfully:', docData);
      
      toast.success('Document uploaded successfully', { id: toastId });
      
      // Verify the document was actually saved
      const { data: verifyDoc, error: verifyError } = await supabase
        .from('documents')
        .select('id')
        .eq('file_path', publicUrl)
        .single();
        
      if (verifyError || !verifyDoc) {
        console.warn('Document verification failed after upload:', verifyError);
        toast.warning('Document uploaded but might not appear immediately. Please refresh.', { id: toastId });
      }
      
      // Notify parent component about successful upload
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      // Clear the file input so the same file can be uploaded again if needed
      if (document.getElementById('document-upload')) {
        (document.getElementById('document-upload') as HTMLInputElement).value = '';
      }
    }
  };

  return (
    <>
      <input 
        type="file" 
        id="document-upload" 
        className="hidden" 
        accept=".pdf,image/jpeg,image/png,image/gif"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      <Button 
        variant="outline" 
        onClick={() => document.getElementById('document-upload')?.click()}
        disabled={isUploading}
        className={isUploading ? "opacity-70 cursor-not-allowed" : ""}
      >
        {isUploading ? (
          <>
            <Upload className="mr-2 h-4 w-4 animate-pulse" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </>
        )}
      </Button>
    </>
  );
};

export default UploadDocumentButton;
