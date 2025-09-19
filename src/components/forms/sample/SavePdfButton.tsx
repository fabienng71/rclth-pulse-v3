
import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { generateSampleRequestPDF } from '@/services/sample-requests/pdfService';
import { SampleRequestFormData } from '@/services/sample-requests';
import { toast } from 'sonner';

interface SavePdfButtonProps {
  formData: SampleRequestFormData;
  requestId?: string;
  requestNumber?: string;
  createdAt?: string;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const SavePdfButton: React.FC<SavePdfButtonProps> = ({
  formData,
  requestId,
  requestNumber,
  createdAt,
  disabled = false,
  variant = 'outline',
  size = 'default'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Memoized PDF data to prevent unnecessary re-preparation
  const pdfData = useMemo(() => ({
    ...formData,
    id: requestId,
    requestNumber,
    created_at: createdAt
  }), [formData, requestId, requestNumber, createdAt]);

  // Memoized filename to prevent re-calculation
  const filename = useMemo(() => 
    `sample-request-${requestNumber || requestId || Date.now()}.pdf`,
    [requestNumber, requestId]
  );

  // Optimized and memoized PDF generation handler
  const handleSavePdf = useCallback(async () => {
    if (isGenerating) return; // Prevent double-clicks
    
    try {
      setIsGenerating(true);

      // Generate PDF with error boundary
      const pdfBlob = await generateSampleRequestPDF(pdfData);
      
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('PDF generation returned empty blob');
      }
      
      // Create and trigger download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('PDF saved successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to generate PDF: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, pdfData, filename]);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleSavePdf}
      disabled={disabled || isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-2" />
          Save PDF
        </>
      )}
    </Button>
  );
};
