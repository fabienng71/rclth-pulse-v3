
import React, { useState, useEffect } from 'react';
import { useShipmentDocuments } from '@/hooks/useShipmentDocuments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileIcon, ExternalLink, FileText, Image, Copy, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

interface ShipmentDocumentsProps {
  shipmentId: string;
}

const ShipmentDocuments: React.FC<ShipmentDocumentsProps> = ({ shipmentId }) => {
  const { documents, isLoading, error, refreshDocuments, deleteDocument } = useShipmentDocuments(shipmentId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [checkedFiles, setCheckedFiles] = useState<Record<string, boolean>>({});
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);

  // Verify all documents on component mount and when documents change
  useEffect(() => {
    const checkFilesExistence = async () => {
      if (!documents.length) return;
      
      const newCheckedFiles: Record<string, boolean> = {};
      
      for (const doc of documents) {
        try {
          // Skip checking if document is currently being deleted
          if (pendingDeletions.includes(doc.id)) {
            newCheckedFiles[doc.id] = false;
            continue;
          }
          
          const response = await fetch(doc.file_path, { method: 'HEAD' });
          newCheckedFiles[doc.id] = response.ok;
        } catch {
          newCheckedFiles[doc.id] = false;
        }
      }
      
      setCheckedFiles(newCheckedFiles);
    };
    
    checkFilesExistence();
  }, [documents, pendingDeletions]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5" />;
    }
    return <FileIcon className="h-5 w-5" />;
  };

  const copyLinkToClipboard = (url: string, fileName: string) => {
    navigator.clipboard.writeText(url)
      .then(() => toast.success(`Link to ${fileName} copied to clipboard`))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleDeleteClick = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    
    try {
      setIsDeleting(true);
      // Immediately mark document as pending deletion
      setPendingDeletions(prev => [...prev, documentToDelete]);
      
      // Create a toast with loading state
      const toastId = toast.loading('Deleting document...');
      
      // Add a delay to ensure all UI states are updated properly
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // First, check if the document exists before attempting deletion
      const { data: checkBeforeDelete } = await supabase
        .from('documents')
        .select('id')
        .eq('id', documentToDelete)
        .single();
      
      if (!checkBeforeDelete) {
        toast.success('Document already deleted', { id: toastId });
        refreshDocuments();
        return;
      }
      
      // Perform the deletion
      const result = await deleteDocument(documentToDelete);
      
      if (result.success) {
        toast.success('Document deleted successfully', { id: toastId });
        
        // Force a refresh after a brief delay to ensure DB changes propagate
        setTimeout(() => {
          refreshDocuments();
          // Remove from pending deletions
          setPendingDeletions(prev => prev.filter(id => id !== documentToDelete));
        }, 800);
      } else {
        console.error('Deletion error:', result.error);
        toast.error(`Failed to delete document: ${result.error?.message || 'Unknown error'}`, { id: toastId });
        
        // Force refresh to ensure UI is in sync with the database
        refreshDocuments();
        // Remove from pending deletions
        setPendingDeletions(prev => prev.filter(id => id !== documentToDelete));
      }
    } catch (err) {
      console.error('Error during document deletion:', err);
      toast.error('An unexpected error occurred while deleting the document');
      // Remove from pending deletions
      setPendingDeletions(prev => prev.filter(id => id !== documentToDelete));
      refreshDocuments();
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Loading documents...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription className="text-red-500">Error loading documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800">{error.message}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => refreshDocuments()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            {documents.length === 0 
              ? 'No documents uploaded for this shipment' 
              : `${documents.length} document${documents.length === 1 ? '' : 's'} for this shipment`}
          </CardDescription>
        </CardHeader>
        {documents.length > 0 && (
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => {
                const fileExists = checkedFiles[doc.id] !== false; // Default to true if not checked yet
                const isPendingDeletion = pendingDeletions.includes(doc.id);
                
                if (isPendingDeletion) {
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-100 opacity-60">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(doc.file_type)}
                        <span className="text-sm font-medium flex items-center">
                          {doc.file_name}
                          <span className="ml-2 text-amber-500 text-xs flex items-center">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Deleting...
                          </span>
                        </span>
                      </div>
                      <div className="flex space-x-2 opacity-50">
                        <Button variant="outline" size="sm" disabled>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(doc.file_type)}
                      <span className="text-sm font-medium">
                        {doc.file_name}
                        {!fileExists && (
                          <span className="ml-2 text-red-500 text-xs flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            File missing
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyLinkToClipboard(doc.file_path, doc.file_name)}
                        disabled={!fileExists}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy link</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        disabled={!fileExists}
                      >
                        <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Open document</span>
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(doc.id)}
                        disabled={isDeleting || isPendingDeletion}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete document</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ShipmentDocuments;
