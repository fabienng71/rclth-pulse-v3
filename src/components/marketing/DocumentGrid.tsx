
import React, { useState } from 'react';
import { FileText, Download, Eye, Trash, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from 'sonner';
import type { Document } from '@/components/marketing/DocumentList';

type DocumentGridProps = {
  documents: Document[];
  onDocumentsChange: () => void;
};

export const DocumentGrid = ({ documents, onDocumentsChange }: DocumentGridProps) => {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  
  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);
        
      if (error) {
        console.error('Error downloading file:', error);
        throw error;
      }
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error handling download:', error);
    }
  };
  
  const handlePreview = async (filePath: string) => {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      // Open the file in a new tab
      window.open(publicUrl, '_blank');
    } catch (error) {
      console.error('Error handling preview:', error);
    }
  };
  
  const toggleSelectDocument = (id: string) => {
    setSelectedDocuments(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id) 
        : [...prev, id]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map(doc => doc.id));
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedDocuments.length === 0) return;
    
    try {
      // Step 1: Get file paths for selected documents to delete from storage
      const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
      const filePaths = selectedDocs.map(doc => doc.file_path);
      
      // Step 2: Delete files from Supabase storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove(filePaths);
      
      if (storageError) {
        throw storageError;
      }
      
      // Step 3: Delete documents from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .in('id', selectedDocuments);
      
      if (dbError) {
        throw dbError;
      }
      
      // Step 4: Update UI and notify user
      toast.success(`${selectedDocuments.length} document(s) deleted successfully`);
      setSelectedDocuments([]);
      onDocumentsChange();
    } catch (error) {
      console.error('Error deleting documents:', error);
      toast.error('Failed to delete selected documents');
    }
  };
  
  // Helper function to determine if file is an image
  const isImageFile = (fileType: string): boolean => {
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType.toLowerCase());
  };

  // Helper function to determine if file is a PDF
  const isPdfFile = (fileType: string): boolean => {
    return fileType.toLowerCase() === 'pdf';
  };

  // Helper function to get thumbnail background class
  const getThumbnailClass = (fileType: string) => {
    if (isPdfFile(fileType)) {
      return 'bg-blue-100';
    } else if (['doc', 'docx'].includes(fileType.toLowerCase())) {
      return 'bg-blue-100';
    } else if (['xls', 'xlsx', 'csv'].includes(fileType.toLowerCase())) {
      return 'bg-green-100';
    } else {
      return 'bg-gray-100';
    }
  };

  return (
    <div>
      {selectedDocuments.length > 0 && (
        <div className="flex justify-between items-center mb-4 p-2 bg-muted/50 rounded-md">
          <span className="text-sm font-medium">
            {selectedDocuments.length} document(s) selected
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedDocuments.length === documents.length ? 'Unselect All' : 'Select All'}
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {documents.map((doc) => {
          const isImage = isImageFile(doc.file_type);
          const isPdf = isPdfFile(doc.file_type);
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(doc.file_path);
          const isSelected = selectedDocuments.includes(doc.id);

          return (
            <div 
              key={doc.id} 
              className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="relative">
                <div 
                  className={`h-32 flex items-center justify-center ${!isImage ? getThumbnailClass(doc.file_type) : ''}`}
                >
                  {isImage ? (
                    <AspectRatio ratio={16/9} className="bg-muted h-32 w-full">
                      <img 
                        src={publicUrl} 
                        alt={doc.file_name} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </AspectRatio>
                  ) : isPdf ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FileText className="h-16 w-16 text-red-500" />
                      <span className="text-xs mt-1">PDF</span>
                    </div>
                  ) : (
                    <FileText className="h-16 w-16 text-gray-500" />
                  )}
                </div>
                
                <div 
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectDocument(doc.id);
                  }}
                >
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-muted'}`}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-1" title={doc.file_name}>
                  {doc.file_name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {doc.uploaded_at && formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-1/2"
                    onClick={() => handlePreview(doc.file_path)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-1/2"
                    onClick={() => handleDownload(doc.file_path, doc.file_name)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
