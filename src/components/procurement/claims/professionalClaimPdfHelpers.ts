
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { addLogoToPdf } from "@/pages/marketing/components/pdf/logoHelpers";

// Augment jsPDF type to include 'lastAutoTable' injected by the autotable plugin
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

export interface ClaimPdfData {
  vendor: { vendor_name: string; vendor_code: string };
  items: any[];
  reason: string;
  note: string;
  value: number;
  currency: string;
  claimNumber?: string;
}

// Generate professional claim letter PDF
export async function generateProfessionalClaimPdf({ claim }: { claim: ClaimPdfData }) {
  const doc = new jsPDF();
  
  // Add company logo
  await addLogoToPdf(doc);

  // Company header information
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("RCL (THAILAND) CO., LTD.", 14, 32);
  doc.text("123 Business Street, Bangkok 10100", 14, 37);
  doc.text("Tel: +66 2 123 4567 | Email: claims@rcl-thailand.com", 14, 42);

  // Date and claim reference
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  const claimRef = claim.claimNumber || `CLM-${Math.floor(Math.random() * 900000 + 100000)}`;
  
  doc.setTextColor(0, 0, 0);
  doc.text(`Date: ${currentDate}`, 14, 55);
  doc.text(`Claim Reference: ${claimRef}`, 14, 60);

  // Vendor address section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("To:", 14, 75);
  doc.setFont("helvetica", "normal");
  doc.text(`${claim.vendor?.vendor_name || 'Vendor Name'}`, 14, 82);
  doc.text(`Vendor Code: ${claim.vendor?.vendor_code || 'N/A'}`, 14, 87);

  // Subject line
  doc.setFont("helvetica", "bold");
  doc.text("Subject: Claim for ", 14, 100);
  doc.setFont("helvetica", "normal");
  doc.text(getReasonSubject(claim.reason), 55, 100);

  // Salutation
  doc.text(`Dear Sir/Madam,`, 14, 113);

  // Letter body
  doc.setFontSize(10);
  const bodyText = generateLetterBody(claim);
  const splitBody = doc.splitTextToSize(bodyText, 180);
  doc.text(splitBody, 14, 125);

  // Calculate Y position after body text
  const bodyHeight = splitBody.length * 4;
  let currentY = 125 + bodyHeight + 10;

  // Items table
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Affected Items:", 14, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [["Item Code", "Description", "Quantity", "Unit Price", "Total Value"]],
    body: claim.items.map(item => [
      item.item_code,
      item.description,
      (item.quantity || '-').toString(),
      (item.unit_price || '-').toString(),
      item.unit_price && item.quantity 
        ? `${(item.unit_price * item.quantity).toFixed(2)} ${claim.currency}`
        : '-'
    ]),
    theme: "grid",
    styles: { 
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    }
  });

  // Use doc.lastAutoTable?.finalY, or fallback
  currentY = (doc.lastAutoTable?.finalY ?? currentY + 50) + 15;

  // Claim value summary
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Claim Value: ${formatCurrency(claim.value, claim.currency)}`, 14, currentY);
  currentY += 10;

  // Additional notes section
  if (claim.note && claim.note.trim()) {
    doc.setFont("helvetica", "bold");
    doc.text("Additional Details:", 14, currentY);
    currentY += 6;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const notesText = stripHtml(claim.note);
    const splitNotes = doc.splitTextToSize(notesText, 180);
    doc.text(splitNotes, 14, currentY);
    currentY += splitNotes.length * 4 + 8;
  }

  // Expected action
  doc.setFont("helvetica", "bold");
  doc.text("Requested Action:", 14, currentY);
  currentY += 6;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const actionText = getExpectedAction(claim.reason);
  const splitAction = doc.splitTextToSize(actionText, 180);
  doc.text(splitAction, 14, currentY);
  currentY += splitAction.length * 4 + 10;

  // Closing
  doc.setFontSize(10);
  doc.text("We appreciate your prompt attention to this matter and look forward to your response.", 14, currentY);
  currentY += 8;
  
  doc.text("Yours faithfully,", 14, currentY);
  currentY += 15;
  
  doc.setFont("helvetica", "bold");
  doc.text("Claims Department", 14, currentY);
  doc.setFont("helvetica", "normal");
  currentY += 5;
  doc.text("RCL (Thailand) Co., Ltd.", 14, currentY);

  // Save the PDF
  doc.save(`Claim_Letter_${claim.vendor?.vendor_code || 'Vendor'}_${claimRef}.pdf`);
}

function getReasonSubject(reason: string): string {
  switch (reason) {
    case "damaged": return "Damaged Goods";
    case "incorrect_quantity": return "Quantity Discrepancy";
    case "not_ordered": return "Unordered Items";
    case "quality_issue": return "Quality Issues";
    case "late_delivery": return "Late Delivery Compensation";
    default: return "Product Issues";
  }
}

function generateLetterBody(claim: ClaimPdfData): string {
  const baseText = `We are writing to formally notify you of an issue with recent deliveries from your company. `;
  
  switch (claim.reason) {
    case "damaged":
      return baseText + `We have received goods in damaged condition, which renders them unsuitable for use or resale. The damage appears to have occurred during transit or packaging, and we require immediate replacement or credit for the affected items listed below.`;
    
    case "incorrect_quantity":
      return baseText + `There is a discrepancy between the quantities specified in our purchase order/invoice and the actual quantities delivered. This variance affects our inventory planning and customer commitments. Please investigate and arrange for the missing quantities to be delivered or provide appropriate credit.`;
    
    case "not_ordered":
      return baseText + `We have received items that were not part of our original order. These additional items are taking up valuable warehouse space and may result in unnecessary costs. Please arrange for collection of these items at your earliest convenience.`;
    
    case "quality_issue":
      return baseText + `The delivered items do not meet the agreed quality standards or specifications. This quality variance impacts our ability to serve our customers effectively. We require replacement items that meet the specified quality criteria or appropriate compensation.`;
    
    case "late_delivery":
      return baseText + `The delivery was significantly delayed beyond the agreed delivery date, causing disruption to our operations and potential loss of business. We are seeking compensation for the inconvenience and additional costs incurred due to this delay.`;
    
    default:
      return baseText + `We have identified issues with the delivered items that require your immediate attention and resolution. Please review the details below and advise on the appropriate course of action.`;
  }
}

function getExpectedAction(reason: string): string {
  switch (reason) {
    case "damaged":
      return "Please arrange for immediate replacement of the damaged items or provide a credit note for the full value. We also request that you review your packaging procedures to prevent future occurrences.";
    
    case "incorrect_quantity":
      return "Please deliver the missing quantities as soon as possible or issue a credit note for the undelivered items. We also request confirmation of your inventory management procedures.";
    
    case "not_ordered":
      return "Please arrange for collection of the unordered items within 7 business days. If collection is not possible, please provide instructions for disposal and compensate for any storage costs incurred.";
    
    case "quality_issue":
      return "Please provide replacement items that meet the agreed specifications or issue a full credit note. We also request a quality improvement plan to prevent similar issues in the future.";
    
    case "late_delivery":
      return "Please provide compensation for the delays and confirm measures to ensure future deliveries meet agreed timelines. We may also require preferential treatment for future orders.";
    
    default:
      return "Please investigate the reported issues and provide a resolution plan within 5 business days. We expect either replacement items, credit notes, or other appropriate compensation.";
  }
}

function formatCurrency(value: number | null, currency: string): string {
  if (!value) return `0 ${currency}`;
  return `${value.toLocaleString()} ${currency}`;
}

function stripHtml(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, "");
}
