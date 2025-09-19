
import { useState } from 'react';
import { Image } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface LogoSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLogo: (logoUrl: string) => void;
}

export function LogoSelectionDialog({ 
  isOpen, 
  onClose, 
  onSelectLogo 
}: LogoSelectionDialogProps) {
  const { documents, isLoading, error } = useDocuments('logos');
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  
  const handleSelectLogo = () => {
    if (selectedLogo) {
      onSelectLogo(selectedLogo);
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Logo</DialogTitle>
          <DialogDescription>
            Select a logo for your quotation
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading logos.</p>
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No logos found in the logos folder.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {documents.map((document) => {
                const publicUrl = supabase.storage.from('documents').getPublicUrl(document.file_path).data.publicUrl;
                return (
                  <div 
                    key={document.id}
                    className={`relative border rounded-md p-2 cursor-pointer transition-all ${
                      selectedLogo === document.file_path 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedLogo(document.file_path)}
                  >
                    <div className="aspect-square flex items-center justify-center bg-gray-50">
                      <img 
                        src={publicUrl}
                        alt={document.file_name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <p className="text-xs mt-1 truncate">{document.file_name}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSelectLogo} 
            disabled={!selectedLogo || isLoading}
          >
            Select Logo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
