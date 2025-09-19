
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { QuotationWithItems } from '@/types/quotations';
import { useQuotations } from '@/hooks/useQuotations';
import { supabase } from '@/integrations/supabase/client';
import { saveDefaultLogo, getDefaultLogo } from '@/utils/logoStorage';
import { downloadQuotationAsPDF, preparePDFElement } from '@/utils/quotationPdfGenerator';
import { toast } from 'sonner';

import { QuotationHeader } from './details/QuotationHeader';
import { CustomerInfoSection } from './details/CustomerInfoSection';
import { QuotationDetailsInfo } from './details/QuotationDetailsInfo';
import { QuotationItemsDisplay } from './details/QuotationItemsDisplay';
import { QuotationNotes } from './details/QuotationNotes';
import { QuotationFooter } from './details/QuotationFooter';
import { DeleteQuotationDialog } from './details/DeleteQuotationDialog';
import { EmailQuotationDialog } from './email/EmailQuotationDialog';

interface QuotationDetailsProps {
  quotation: QuotationWithItems;
}

export const QuotationDetails = ({ quotation }: QuotationDetailsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { deleteQuotation } = useQuotations();
  
  useEffect(() => {
    const defaultLogo = getDefaultLogo();
    if (defaultLogo) {
      setSelectedLogo(defaultLogo);
    }
  }, []);
  
  const handleDelete = async () => {
    try {
      await deleteQuotation.mutateAsync(quotation.id);
      navigate('/quotations');
    } catch (error) {
      console.error('Error deleting quotation:', error);
    }
    setIsDeleteDialogOpen(false);
  };
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Print/Export functionality using react-to-print
  const handlePrint = useReactToPrint({
    documentTitle: `Quotation-${quotation.quote_number || 'Draft'}`,
    onAfterPrint: () => {
      toast.success('Export Complete', {
        description: 'Quotation has been sent to printer/export.'
      });
    },
    contentRef: printRef,
  });

  const handleDownloadPDF = async () => {
    if (!printRef.current) {
      toast.error('Unable to generate PDF', {
        description: 'Quotation content not ready. Please try again.'
      });
      return;
    }

    setIsGeneratingPdf(true);
    
    try {
      // Prepare the element for PDF capture
      await preparePDFElement(printRef.current);
      
      // Generate and download the PDF
      await downloadQuotationAsPDF(quotation, {
        quality: 0.95,
        scale: 2,
        margin: 15
      });

      toast.success('PDF Generated Successfully', {
        description: `Quotation ${quotation.quote_number || 'Draft'} has been saved as PDF.`
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('PDF Generation Failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.'
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  const handleLogoChange = (logoPath: string) => {
    setSelectedLogo(logoPath);
    saveDefaultLogo(logoPath);
  };
  
  const getLogoPublicUrl = (filePath: string) => {
    return supabase.storage.from('documents').getPublicUrl(filePath).data.publicUrl;
  };
  
  return (
    <div>
      <QuotationHeader 
        quotation={quotation} 
        onPrint={handlePrint}
        onDownloadPDF={handleDownloadPDF}
        onSendEmail={() => setIsEmailDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onLogoChange={handleLogoChange}
        logoUrl={selectedLogo}
        isGeneratingPdf={isGeneratingPdf}
      />
      
      <div ref={printRef} data-pdf-content="true" className="bg-white p-6 rounded-lg border shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            {selectedLogo && (
              <div className="flex justify-start mb-6 w-full">
                <img 
                  src={getLogoPublicUrl(selectedLogo)} 
                  alt="Company Logo"
                  className="max-h-20 object-contain" 
                />
              </div>
            )}
            <CustomerInfoSection quotation={quotation} />
          </div>
          <QuotationDetailsInfo quotation={quotation} />
        </div>
        
        <QuotationItemsDisplay quotation={quotation} />
        <QuotationNotes notes={quotation.notes} />
        <QuotationFooter createdAt={quotation.created_at} />
      </div>
      
      <DeleteQuotationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDelete}
        isDeleting={deleteQuotation.isPending}
      />

      <EmailQuotationDialog
        quotation={quotation}
        isOpen={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
      />
    </div>
  );
};
