
import React, { useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { ChevronLeft, Folder, LayoutList, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentList } from '@/components/marketing/DocumentList';
import { DocumentGrid } from '@/components/marketing/DocumentGrid';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from 'sonner';

const FolderDocuments = () => {
  const { folderName } = useParams<{ folderName: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Normalize folder name for display and query purposes
  const normalizedFolderName = useMemo(() => {
    if (!folderName) return '';
    return folderName.toLowerCase();
  }, [folderName]);
  
  // Capitalize first letter for display
  const displayFolderName = useMemo(() => {
    if (!folderName) return '';
    return folderName.charAt(0).toUpperCase() + folderName.slice(1).toLowerCase();
  }, [folderName]);
  
  const { documents, isLoading, error } = useDocuments(normalizedFolderName, refreshTrigger);
  
  // Handle any errors when fetching documents
  React.useEffect(() => {
    if (error) {
      toast("Failed to load documents", {
        description: "There was an error loading the documents. Please try again.",
        duration: 3000
      });
    }
  }, [error]);
  
  const handleBack = () => {
    navigate('/marketing/documents');
  };
  
  const handleDocumentsChange = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container py-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={handleBack} className="mr-4">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold">
                <span className="flex items-center gap-2">
                  <Folder className="h-6 w-6" />
                  {displayFolderName} Documents
                </span>
              </h1>
            </div>
          </div>
          
          {/* View Toggle */}
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'list' | 'grid')}>
            <ToggleGroupItem value="list" aria-label="View as list">
              <LayoutList className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="View as grid">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <p className="text-muted-foreground mb-8">
          View and manage your {displayFolderName.toLowerCase()} documents.
        </p>
        
        {viewMode === 'list' ? (
          <DocumentList 
            documents={documents} 
            isLoading={isLoading} 
            onDocumentsChange={handleDocumentsChange} 
          />
        ) : (
          <DocumentGrid 
            documents={documents} 
            onDocumentsChange={handleDocumentsChange} 
          />
        )}
      </div>
    </div>
  );
};

export default FolderDocuments;
