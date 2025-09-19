import { useState, useEffect } from 'react';
import { Mail, Loader2, Send, Paperclip, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { QuotationWithItems } from '@/types/quotations';
import { ContactSelector } from './ContactSelector';
import { TemplateSelector, EmailTemplate } from './TemplateSelector';
import { downloadQuotationAsPDF, preparePDFElement } from '@/utils/quotationPdfGenerator';
import { toast } from 'sonner';

interface Contact {
  id: string;
  email: string;
  name: string;
  customer_code?: string;
  customer_name?: string;
  type: 'contact' | 'lead';
}

interface EmailQuotationDialogProps {
  quotation: QuotationWithItems;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailQuotationDialog = ({
  quotation,
  isOpen,
  onClose,
}: EmailQuotationDialogProps) => {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedContacts([]);
      setSelectedTemplate(null);
      setError(null);
    }
  }, [isOpen]);

  const handleSendEmail = async () => {
    if (!selectedContacts || !selectedContacts.length) {
      setError('Please select at least one recipient');
      return;
    }

    if (!selectedTemplate) {
      setError('Please select an email template');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      // Generate PDF attachment (with error handling)
      let pdfBase64: string | undefined;
      
      // TEMPORARY: Skip PDF for testing
      const skipPDF = false; // Set to true to test without PDF
      
      if (skipPDF) {
        toast.info('Skipping PDF generation for testing...');
        pdfBase64 = undefined;
      } else {
        try {
          toast.info('Generating PDF attachment...', {
            description: 'Please wait while we prepare your quotation PDF'
          });

        const quotationElement = document.querySelector('[data-pdf-content]') as HTMLElement;
        
        if (!quotationElement) {
          console.warn('Quotation content not found, sending email without PDF attachment');
          pdfBase64 = undefined;
        } else {
          // Prepare element for PDF capture
          await preparePDFElement(quotationElement);

          // Generate PDF with optimized settings for smaller file size
          const canvas = await import('html2canvas').then(mod => mod.default(quotationElement, {
            scale: 1.5, // Reduced from 2 to 1.5 for smaller file size
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: 0,
          }));

          // Use lower quality JPEG for smaller size
          const imgData = canvas.toDataURL('image/jpeg', 0.8); // Reduced from 0.95 to 0.8
          
          // Create PDF
          const jsPDF = (await import('jspdf')).default;
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add image with compression
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'MEDIUM');
          pdfBase64 = pdf.output('datauristring').split(',')[1];
          
          console.log('PDF generated successfully, size:', pdfBase64.length, 'characters');
        }
        } catch (pdfError) {
          console.error('PDF generation failed:', pdfError);
          toast.info('PDF generation failed, sending email without attachment');
          pdfBase64 = undefined;
        }
      }

      toast.info('Sending email...', {
        description: `Sending to ${selectedContacts?.length || 0} recipient(s)`
      });

      // Send email via Supabase Edge Function with timeout
      console.log('Calling Edge Function...');
      console.log('Payload size:', JSON.stringify({
        quotationSize: JSON.stringify(quotation).length,
        recipientsCount: selectedContacts?.length,
        templateSize: JSON.stringify(selectedTemplate).length,
        pdfBufferSize: pdfBase64?.length || 0
      }));
      
      const { data, error: emailError } = await Promise.race([
        supabase.functions.invoke('send-quotation-email', {
          body: {
            quotation: quotation,
            recipients: (selectedContacts || []).map(contact => ({
              email: contact.email,
              name: contact.name
            })),
            template: selectedTemplate,
            pdfBuffer: pdfBase64,
            senderName: 'RCLT Holdings'
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 60 seconds')), 60000)
        )
      ]) as any;

      console.log('Edge Function response:', { data, error: emailError });

      if (emailError) {
        console.error('Email error:', emailError);
        throw new Error(emailError.message || 'Failed to send email');
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.success) {
        console.error('Function returned unsuccessful:', data);
        throw new Error('Email sending failed - unknown error');
      }

      console.log('Email sent successfully!');

      toast.success('Email sent successfully!', {
        description: `Quotation sent to ${selectedContacts?.length || 0} recipient(s)`
      });

      // Reset form and close dialog
      setSelectedContacts([]);
      setSelectedTemplate(null);
      onClose();

    } catch (error) {
      console.error('Error sending email:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast.error('Failed to send email', {
        description: errorMessage
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setSelectedContacts([]);
      setSelectedTemplate(null);
      setError(null);
      onClose();
    }
  };

  const getSubjectPreview = () => {
    if (!selectedTemplate) return '';
    
    const variables = {
      customer_name: quotation.customer_name || quotation.lead_name || 'Customer',
      quote_number: quotation.quote_number || 'Draft',
      company_name: 'RCLT Holdings'
    };

    let subject = selectedTemplate.subject;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
    }

    return subject;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Quotation by Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Quotation Summary */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Quotation Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Quote Number:</span>
                <div className="font-medium">{quotation.quote_number || 'Draft'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <div className="font-medium">
                  {quotation.customer_name || quotation.lead_name}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <div className="font-medium">
                  ฿{quotation.total ? new Intl.NumberFormat('th-TH').format(quotation.total) : '0'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary" className="ml-1">
                  {quotation.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Selection */}
          <ContactSelector
            quotation={quotation}
            selected={selectedContacts}
            onChange={setSelectedContacts}
          />

          <Separator />

          {/* Template Selection */}
          <TemplateSelector
            quotation={quotation}
            selected={selectedTemplate}
            onChange={setSelectedTemplate}
          />

          {/* Subject Preview */}
          {selectedTemplate && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Subject Preview</label>
              <div className="p-3 bg-muted/30 rounded-lg text-sm font-mono">
                {getSubjectPreview()}
              </div>
            </div>
          )}

          <Separator />

          {/* PDF Attachment Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              PDF Attachment
            </h4>
            <p className="text-sm text-muted-foreground">
              A PDF copy of this quotation will be automatically generated and attached to the email.
            </p>
            <div className="mt-2">
              <Badge variant="outline">
                Quotation-{quotation.quote_number || 'Draft'}.pdf
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-2">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-muted-foreground">
              {(selectedContacts?.length || 0) > 0 && selectedTemplate && (
                <span>Ready to send to {selectedContacts?.length || 0} recipient(s)</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isSending}>
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={
                  !(selectedContacts?.length) || 
                  !selectedTemplate || 
                  isSending
                }
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};