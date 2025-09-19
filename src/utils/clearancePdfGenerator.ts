
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClearanceItem } from '@/hooks/useClearanceData';
import { supabase } from '@/integrations/supabase/client';

interface ClearancePDFOptions {
  selectedItems: ClearanceItem[];
  month?: string;
  reference?: string;
}

export const generateClearancePDF = async ({ 
  selectedItems, 
  month, 
  reference 
}: ClearancePDFOptions): Promise<void> => {
  try {
    const doc = new jsPDF();
    let yPosition = 20;

    // Try to load the specific company logo
    let logoData: string | null = null;
    try {
      const { data: logoBlob } = await supabase.storage
        .from('documents')
        .download('logo/1743983989255-RCL_TH_Colour.png');
      
      if (logoBlob) {
        logoData = await blobToBase64(logoBlob);
      }
    } catch (logoError) {
      console.warn('Could not load specific logo:', logoError);
      // Fallback to search for any logo file
      try {
        const { data: files } = await supabase.storage
          .from('documents')
          .list('logo');
        
        if (files && files.length > 0) {
          const logoFile = files.find(file => 
            file.name.toLowerCase().includes('logo') || 
            file.name.toLowerCase().includes('company')
          );
          
          if (logoFile) {
            const { data: logoBlob } = await supabase.storage
              .from('documents')
              .download(`logo/${logoFile.name}`);
            
            if (logoBlob) {
              logoData = await blobToBase64(logoBlob);
            }
          }
        }
      } catch (fallbackError) {
        console.warn('Could not load fallback logo:', fallbackError);
      }
    }

    // Add logo if available
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', 15, 10, 40, 20); // Maintain aspect ratio
        yPosition = 40;
      } catch (logoError) {
        console.warn('Could not add logo to PDF:', logoError);
        yPosition = 20;
      }
    }

    // Add header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Clearance Item List', 15, yPosition);
    yPosition += 15;

    // Add metadata
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    if (month || reference) {
      if (month) {
        doc.text(`Month/Reference: ${month}`, 15, yPosition);
        yPosition += 8;
      }
      if (reference && reference !== month) {
        doc.text(`Reference: ${reference}`, 15, yPosition);
        yPosition += 8;
      }
    }
    
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, yPosition);
    doc.text(`Total Items: ${selectedItems.length}`, 15, yPosition + 8);
    yPosition += 20;

    // Prepare table data (removed Status column)
    const tableColumns = [
      'Item Code',
      'Description', 
      'Quantity',
      'UOM',
      'Expiration Date',
      'Clearance Price'
    ];

    const tableRows = selectedItems.map(item => [
      item.item_code,
      item.description || 'N/A',
      Math.floor(item.quantity).toLocaleString(),
      item.uom || 'N/A',
      item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : 'N/A',
      item.clearance_price ? Math.floor(item.clearance_price).toLocaleString() : '-'
    ]);

    // Add table using the same pattern as marketing PDF components
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: yPosition,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Item Code
        1: { cellWidth: 45 }, // Description (wider since no status column)
        2: { cellWidth: 25, halign: 'right' }, // Quantity
        3: { cellWidth: 20 }, // UOM
        4: { cellWidth: 30 }, // Expiration Date
        5: { cellWidth: 30, halign: 'right' }, // Clearance Price
      },
    });

    // Save the PDF (removed footer text)
    const filename = `clearance-list-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
