import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QuotationWithItems } from '@/types/quotations';

export interface PdfGenerationOptions {
  filename?: string;
  quality?: number;
  margin?: number;
  scale?: number;
}

export const generateQuotationPDF = async (
  element: HTMLElement,
  quotation: QuotationWithItems,
  options: PdfGenerationOptions = {}
): Promise<void> => {
  try {
    const {
      filename = `Quotation-${quotation.quote_number || 'Draft'}-${quotation.id.slice(0, 8)}`,
      quality = 1.0,
      margin = 10,
      scale = 2
    } = options;

    // Configure html2canvas for high quality capture
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      width: element.scrollWidth,
      height: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure all styles are properly applied in the cloned document
        const clonedElement = clonedDoc.querySelector('[data-pdf-content]') as HTMLElement;
        if (clonedElement) {
          clonedElement.style.transform = 'scale(1)';
          clonedElement.style.transformOrigin = 'top left';
          
          // Ensure text is crisp and readable
          const textElements = clonedElement.querySelectorAll('*');
          textElements.forEach((el: any) => {
            el.style.fontSmooth = 'always';
            el.style.webkitFontSmoothing = 'antialiased';
            el.style.textRendering = 'optimizeLegibility';
          });
        }
      }
    });

    // Calculate PDF dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Standard A4 dimensions in mm
    const a4Width = 210;
    const a4Height = 297;
    
    // Calculate scale to fit content on A4
    const contentWidth = a4Width - (margin * 2);
    const contentHeight = a4Height - (margin * 2);
    
    const widthRatio = contentWidth / (imgWidth * 0.264583); // Convert pixels to mm
    const heightRatio = contentHeight / (imgHeight * 0.264583);
    const finalScale = Math.min(widthRatio, heightRatio, 1);
    
    const scaledWidth = (imgWidth * 0.264583) * finalScale;
    const scaledHeight = (imgHeight * 0.264583) * finalScale;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: scaledHeight > scaledWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Add metadata
    pdf.setProperties({
      title: `Quotation ${quotation.quote_number || 'Draft'}`,
      subject: `Quotation for ${quotation.customer_name || quotation.lead_name || 'Customer'}`,
      author: 'RCLT Holdings',
      creator: 'RCLT Holdings Quotation System',
      keywords: 'quotation, proposal, estimate'
    });

    // Convert canvas to image and add to PDF
    const imgData = canvas.toDataURL('image/jpeg', quality);
    
    // Center the content on the page
    const xPos = (pdf.internal.pageSize.getWidth() - scaledWidth) / 2;
    const yPos = margin;
    
    pdf.addImage(imgData, 'JPEG', xPos, yPos, scaledWidth, scaledHeight, undefined, 'FAST');

    // Add footer with generation timestamp
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    const timestamp = new Date().toLocaleString();
    const footerText = `Generated on ${timestamp}`;
    const textWidth = pdf.getStringUnitWidth(footerText) * 8 / pdf.internal.scaleFactor;
    pdf.text(footerText, pageWidth - textWidth - margin, pageHeight - 5);

    // Save the PDF
    pdf.save(`${filename}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

export const downloadQuotationAsPDF = async (
  quotation: QuotationWithItems,
  options: PdfGenerationOptions = {}
): Promise<void> => {
  // Find the quotation content element
  const element = document.querySelector('[data-pdf-content]') as HTMLElement;
  
  if (!element) {
    throw new Error('Quotation content not found. Please ensure the page has loaded completely.');
  }

  // Show loading state by temporarily disabling interactions
  const originalPointerEvents = element.style.pointerEvents;
  element.style.pointerEvents = 'none';
  
  try {
    await generateQuotationPDF(element, quotation, options);
  } finally {
    // Restore interactions
    element.style.pointerEvents = originalPointerEvents;
  }
};

// Helper function to prepare element for PDF capture
export const preparePDFElement = (element: HTMLElement): void => {
  // Ensure the element has the data attribute for identification
  element.setAttribute('data-pdf-content', 'true');
  
  // Apply PDF-specific styles
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';
  
  // Ensure all images are loaded
  const images = element.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img) => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve(true);
      } else {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
      }
    });
  });
  
  return Promise.all(imagePromises) as any;
};