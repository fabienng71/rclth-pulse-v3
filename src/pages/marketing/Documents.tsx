
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { ChevronLeft, Upload, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, FileText, Image, Book, Percent } from 'lucide-react';
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

type FolderCardProps = {
  title: string;
  icon: React.ElementType;
  onClick: () => void;
}

const FolderCard = ({ title, icon: Icon, onClick }: FolderCardProps) => (
  <Card 
    className="cursor-pointer hover:shadow-md transition-shadow"
    onClick={onClick}
  >
    <CardHeader className="flex flex-row items-center gap-4">
      <div className="bg-primary/10 p-3 rounded-md">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Browse {title.toLowerCase()} documents</p>
    </CardContent>
  </Card>
);

const Documents = () => {
  const navigate = useNavigate();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('catalog'); // Default to catalog
  const [isUploading, setIsUploading] = useState(false);
  
  const handleBack = () => {
    navigate('/marketing');
  };

  const handleFolderClick = (folder: string) => {
    // Normalize the folder name to lowercase for consistent routing
    navigate(`/marketing/documents/${folder.toLowerCase()}`);
  };

  const handleUploadDialogOpen = () => {
    setIsUploadDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadDocuments = async () => {
    if (!selectedFile) {
      toast("Please select a file to upload", {
        description: "No file was selected for upload.",
        duration: 3000
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Generate a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${selectedFolder}/${Date.now()}-${selectedFile.name}`;
      
      console.log(`Uploading file to path: ${filePath}`);
      
      // Upload file to the documents bucket in the specified folder
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);
        
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }
      
      // Save file metadata to the documents table
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          file_name: selectedFile.name,
          file_path: filePath,
          file_type: fileExt,
          description: `${selectedFolder.charAt(0).toUpperCase() + selectedFolder.slice(1)} document`,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });
        
      if (dbError) {
        console.error("Database insert error:", dbError);
        throw dbError;
      }
      
      toast("Document uploaded successfully", {
        description: `File uploaded to ${selectedFolder} folder.`,
        duration: 3000
      });
      
      // Close the dialog after upload
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast("Upload failed", {
        description: "There was an error uploading your document. Please try again.",
        duration: 3000
      });
    } finally {
      setIsUploading(false);
    }
  };

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
              <h1 className="text-3xl font-semibold">Marketing Documents</h1>
            </div>
          </div>
          <Button onClick={handleUploadDialogOpen}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Documents
          </Button>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Access and manage marketing documents, catalogs, and leaflets in one place.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FolderCard 
            title="Catalog" 
            icon={BookOpen} 
            onClick={() => handleFolderClick('Catalog')}
          />
          <FolderCard 
            title="Leaflet" 
            icon={FileText} 
            onClick={() => handleFolderClick('Leaflet')}
          />
          <FolderCard 
            title="Logos" 
            icon={Image} 
            onClick={() => handleFolderClick('Logos')}
          />
          <FolderCard 
            title="Books" 
            icon={Book} 
            onClick={() => handleFolderClick('Books')}
          />
          <FolderCard 
            title="Promotions" 
            icon={Percent} 
            onClick={() => handleFolderClick('Promotions')}
          />
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
              <DialogDescription>
                Select documents to upload to the marketing library.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="grid w-full items-center gap-1.5">
                <label htmlFor="folder-select" className="text-sm font-medium">
                  Select Folder
                </label>
                <Select 
                  value={selectedFolder} 
                  onValueChange={setSelectedFolder}
                >
                  <SelectTrigger id="folder-select">
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="catalog">Catalog</SelectItem>
                    <SelectItem value="leaflet">Leaflet</SelectItem>
                    <SelectItem value="logos">Logos</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="promotions">Promotions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <label htmlFor="document-upload" className="text-sm font-medium">
                  Choose File
                </label>
                <Input 
                  id="document-upload" 
                  type="file" 
                  className="cursor-pointer" 
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUploadDocuments} 
                disabled={isUploading || !selectedFile}
              >
                <FileUp className="mr-2 h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Documents;
