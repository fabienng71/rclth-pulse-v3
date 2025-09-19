
import React, { useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { FileText, Download, Eye, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Document = {
  id: string;
  file_name: string;
  file_type: string;
  file_path: string;
  description: string;
  uploaded_at: string;
};

type DocumentListProps = {
  documents: Document[];
  isLoading: boolean;
  onDocumentsChange: () => void;
};

export const DocumentList = ({ documents, isLoading, onDocumentsChange }: DocumentListProps) => {
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
  
  const handlePreview = async (filePath: string, fileType: string) => {
    try {
      // Fix: getPublicUrl doesn't return an error property, just the publicUrl
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
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(documents.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No documents found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload documents to see them here.
        </p>
      </div>
    );
  }

  // Determine if all documents are selected
  const allSelected = selectedDocuments.length === documents.length && documents.length > 0;
  // Determine if some documents are selected (for the indeterminate state visual)
  const someSelected = selectedDocuments.length > 0 && selectedDocuments.length < documents.length;

  return (
    <div>
      {selectedDocuments.length > 0 && (
        <div className="flex justify-between items-center mb-4 p-2 bg-muted/50 rounded-md">
          <span className="text-sm font-medium">
            {selectedDocuments.length} document(s) selected
          </span>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDeleteSelected}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox 
                  onCheckedChange={(checked) => handleSelectAll(checked === true)}
                  checked={allSelected}
                  className={someSelected ? "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground" : ""}
                  data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedDocuments.includes(doc.id)} 
                    onCheckedChange={() => toggleSelectDocument(doc.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{doc.file_name}</TableCell>
                <TableCell className="uppercase text-xs">{doc.file_type}</TableCell>
                <TableCell>{doc.description}</TableCell>
                <TableCell>
                  {doc.uploaded_at && formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePreview(doc.file_path, doc.file_type)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(doc.file_path, doc.file_name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
