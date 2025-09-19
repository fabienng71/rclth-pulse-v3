import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { SampleRequestFormData } from '@/services/sample-requests';

interface SampleRequestPDFData extends SampleRequestFormData {
  id?: string;
  created_at?: string;
  requestNumber?: string;
}

export const generateSampleRequestPDF = async (data: SampleRequestPDFData): Promise<Blob> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Add logo if available
  await addLogoToPDF(doc);
  yPosition = 50;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Sample Request', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Request details
  if (data.requestNumber || data.id) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Request #: ${data.requestNumber || data.id || 'N/A'}`, 20, yPosition);
    yPosition += 6;
  }

  if (data.created_at) {
    doc.text(`Date: ${new Date(data.created_at).toLocaleDateString()}`, 20, yPosition);
    yPosition += 10;
  }

  // Customer Information
  yPosition = addSectionHeader(doc, 'Customer Information', yPosition);
  yPosition = addField(doc, 'Customer Code:', data.customerCode, yPosition);
  yPosition = addField(doc, 'Customer Name:', data.customerName, yPosition);
  yPosition += 5;

  // Salesperson Information
  if (data.createdByName || data.salespersonCode) {
    yPosition = addSectionHeader(doc, 'Request Details', yPosition);
    if (data.createdByName) {
      yPosition = addField(doc, 'Created by:', data.createdByName, yPosition);
    }
    if (data.salespersonCode) {
      yPosition = addField(doc, 'Salesperson Code:', data.salespersonCode, yPosition);
    }
    if (data.followUpDate) {
      yPosition = addField(doc, 'Follow-up Date:', data.followUpDate.toLocaleDateString(), yPosition);
    }
    yPosition += 5;
  }

  // Items Section
  yPosition = addSectionHeader(doc, 'Requested Items', yPosition);
  
  if (data.items && data.items.length > 0) {
    // Table headers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 20, yPosition);
    doc.text('Item Code', 30, yPosition);
    doc.text('Description', 70, yPosition);
    doc.text('Quantity', 150, yPosition);
    doc.text('Price', 170, yPosition);
    yPosition += 8;

    // Draw header line
    doc.setLineWidth(0.3);
    doc.line(20, yPosition - 2, 190, yPosition - 2);
    yPosition += 2;

    // Table content with proper description wrapping
    doc.setFont('helvetica', 'normal');
    data.items.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      const startY = yPosition;
      
      // Item number
      doc.text((index + 1).toString(), 20, yPosition);
      
      // Item code
      doc.text(item.item_code, 30, yPosition);
      
      // Handle description with proper text wrapping
      const description = item.description || '';
      const maxDescriptionWidth = 75; // Adjust column width for description
      const descriptionLines = doc.splitTextToSize(description, maxDescriptionWidth);
      
      // Calculate the height needed for this row based on description lines
      const lineHeight = 5;
      const rowHeight = Math.max(lineHeight, descriptionLines.length * lineHeight);
      
      // Add description with multiple lines if needed
      descriptionLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, 70, yPosition + (lineIndex * lineHeight));
      });
      
      // Quantity (aligned to the middle of the row)
      const middleY = yPosition + (rowHeight / 2);
      doc.text(item.quantity.toString(), 150, middleY);
      
      // Price (aligned to the middle of the row)
      if (item.is_free) {
        doc.text('Free', 170, middleY);
      } else if (item.price) {
        doc.text(`฿${item.price.toFixed(2)}`, 170, middleY);
      } else {
        doc.text('-', 170, middleY);
      }
      
      // Move to next row position
      yPosition += rowHeight + 2; // Add small spacing between rows
    });

    yPosition += 5;
  } else {
    yPosition = addField(doc, 'No items requested', '', yPosition);
    yPosition += 5;
  }

  // Notes Section
  if (data.notes) {
    yPosition = addSectionHeader(doc, 'Notes', yPosition);
    
    // Handle multi-line notes
    const noteLines = doc.splitTextToSize(data.notes, 170);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    noteLines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 5;
    });
    yPosition += 10;
  }

  // Footer
  const currentDate = new Date().toLocaleDateString();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${currentDate}`, 20, pageHeight - 10);

  return doc.output('blob');
};

const addLogoToPDF = async (doc: jsPDF): Promise<void> => {
  try {
    const { data: files, error } = await supabase.storage
      .from('documents')
      .list('logos', { limit: 10 });

    if (error || !files || files.length === 0) {
      return;
    }

    const logoFile = files.find(file => 
      file.name.includes('.png') || 
      file.name.includes('.jpg') || 
      file.name.includes('.jpeg')
    );
    
    if (!logoFile) return;

    const { data: logoData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(`logos/${logoFile.name}`);

    if (downloadError || !logoData) return;

    const reader = new FileReader();
    reader.readAsDataURL(logoData);
    
    await new Promise<void>((resolve) => {
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          try {
            const base64Logo = reader.result.split(',')[1];
            const img = new Image();
            img.onload = function() {
              const maxWidth = 50;
              const maxHeight = 25;
              const aspectRatio = img.width / img.height;
              
              let logoWidth = maxWidth;
              let logoHeight = maxWidth / aspectRatio;
              
              if (logoHeight > maxHeight) {
                logoHeight = maxHeight;
                logoWidth = maxHeight * aspectRatio;
              }
              
              doc.addImage(base64Logo, 'PNG', 20, 10, logoWidth, logoHeight);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = reader.result;
          } catch (error) {
            resolve();
          }
        } else {
          resolve();
        }
      };
    });
  } catch (error) {
    console.error('Error processing logo:', error);
  }
};

const addSectionHeader = (doc: jsPDF, title: string, yPosition: number): number => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, yPosition);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition + 2, 190, yPosition + 2);
  return yPosition + 8;
};

const addField = (doc: jsPDF, label: string, value: string, yPosition: number): number => {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(label, 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(value || '', 70, yPosition);
  return yPosition + 6;
};
