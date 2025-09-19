import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { WriteoffRequestWithItems } from './types';
import { format } from 'date-fns';

// Extend jsPDF type for autoTable
interface ExtendedJsPDF extends jsPDF {
  autoTable: (options: any) => void;
  lastAutoTable: { finalY: number };
}

export const generateWriteoffPDF = (writeoffRequest: WriteoffRequestWithItems): void => {
  const pdf = new jsPDF() as ExtendedJsPDF;
  
  // Add company header
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text('WRITE-OFF REQUEST', 20, 25);
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Request ID: ${writeoffRequest.id.slice(0, 8)}`, 20, 35);
  pdf.text(`Date: ${format(new Date(writeoffRequest.created_at), 'PPP')}`, 20, 42);
  pdf.text(`Status: ${writeoffRequest.status.toUpperCase()}`, 20, 49);
  
  // Add writeoff details
  pdf.setFontSize(14);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Write-off Details', 20, 65);
  
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  pdf.text(`Reason: ${writeoffRequest.reason.charAt(0).toUpperCase() + writeoffRequest.reason.slice(1)}`, 20, 75);
  
  if (writeoffRequest.notes) {
    pdf.text('Notes:', 20, 85);
    const splitNotes = pdf.splitTextToSize(writeoffRequest.notes, 170);
    pdf.text(splitNotes, 20, 92);
  }
  
  // Add items table
  const tableStartY = writeoffRequest.notes ? 110 : 95;
  
  pdf.setFontSize(14);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Items', 20, tableStartY);
  
  const tableData = writeoffRequest.writeoff_request_items.map(item => [
    item.item_code,
    item.description || '',
    item.quantity.toString(),
    format(new Date(item.exp_date), 'PP'),
    `$${(item.cogs_unit || 0).toFixed(2)}`,
    `$${item.total_cost.toFixed(2)}`
  ]);
  
  pdf.autoTable({
    startY: tableStartY + 10,
    head: [['Item Code', 'Description', 'Quantity', 'Exp. Date', 'Unit Cost', 'Total Cost']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    }
  });
  
  // Add total
  const finalY = pdf.lastAutoTable.finalY + 10;
  pdf.setFontSize(12);
  pdf.setTextColor(40, 40, 40);
  pdf.text(`Total Write-off Cost: $${writeoffRequest.total_cost.toFixed(2)}`, 140, finalY);
  
  // Add footer
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('This document was generated automatically by the Write-off Management System', 20, pdf.internal.pageSize.height - 10);
  
  // Save the PDF
  const fileName = `writeoff-request-${writeoffRequest.id.slice(0, 8)}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  pdf.save(fileName);
};