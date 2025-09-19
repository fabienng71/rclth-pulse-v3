
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, FileDown, Trash2, Image, Loader2, Printer, Mail } from 'lucide-react';
import { QuotationWithItems } from '@/types/quotations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogoSelectionDialog } from './LogoSelectionDialog';
import { toast } from 'sonner';
import { saveDefaultLogo } from '@/utils/logoStorage';

interface QuotationHeaderProps {
  quotation: QuotationWithItems;
  onPrint: () => void;
  onDownloadPDF: () => void;
  onSendEmail: () => void;
  onDelete: () => void;
  onLogoChange?: (logoUrl: string) => void;
  logoUrl?: string | null;
  isGeneratingPdf?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-500';
    case 'final':
      return 'bg-blue-500';
    case 'sent':
      return 'bg-purple-500';
    case 'accepted':
      return 'bg-green-500';
    case 'rejected':
      return 'bg-red-500';
    case 'expired':
      return 'bg-orange-500';
    case 'archived':
      return 'bg-gray-700';
    default:
      return 'bg-gray-500';
  }
};

export const QuotationHeader = ({ 
  quotation, 
  onPrint,
  onDownloadPDF,
  onSendEmail,
  onDelete,
  onLogoChange,
  logoUrl,
  isGeneratingPdf = false
}: QuotationHeaderProps) => {
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  
  const handleSelectLogo = (logoUrl: string) => {
    if (onLogoChange) {
      onLogoChange(logoUrl);
      saveDefaultLogo(logoUrl); // Save logo as default when selected
      toast("Logo selected", {
        description: "The logo has been set as default for all quotations."
      });
    }
  };
  
  return (
    <div className="flex justify-between items-start mb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold md:text-3xl">{quotation.title}</h1>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(quotation.status)}>{quotation.status}</Badge>
          <span className="text-muted-foreground">
            {quotation.quote_number || 'Draft'}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsLogoDialogOpen(true)}>
          <Image className="h-4 w-4 mr-1" /> Choose Logo
        </Button>

        <Button variant="outline" size="sm" onClick={onSendEmail}>
          <Mail className="h-4 w-4 mr-1" /> Send Email
        </Button>
        
        {/* Export/PDF Actions Group */}
        <div className="flex gap-1 border rounded-md">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onPrint}
            className="rounded-r-none border-r"
          >
            <Printer className="h-4 w-4 mr-1" /> Export
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDownloadPDF}
            disabled={isGeneratingPdf}
            className="rounded-l-none"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> 
                PDF...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-1" /> 
                PDF
              </>
            )}
          </Button>
        </div>
        
        <Button variant="outline" size="sm" asChild>
          <Link to={`/quotations/${quotation.id}/edit`}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>
      
      <LogoSelectionDialog 
        isOpen={isLogoDialogOpen}
        onClose={() => setIsLogoDialogOpen(false)}
        onSelectLogo={handleSelectLogo}
      />
    </div>
  );
};
