import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { addLogoToPdf } from "@/pages/marketing/components/pdf/logoHelpers";

// Augment jsPDF type to include 'lastAutoTable' injected by the autotable plugin
import type { jsPDF as jsPDFType } from "jspdf";
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
      // ... other properties exist but we only care about finalY here
    };
  }
}

// Generate claim PDF - Updated to use professional format
export async function generateClaimPdf({
  claim
}: {
  claim: {
    vendor: { vendor_name: string; vendor_code: string },
    items: any[],
    reason: string,
    note: string,
    value: number,
    currency: string
  }
}) {
  // Import and use the new professional PDF generator
  const { generateProfessionalClaimPdf } = await import('./professionalClaimPdfHelpers');
  
  await generateProfessionalClaimPdf({ claim });
}

function reasonText(reason: string) {
  switch (reason) {
    case "damaged": return "Damaged Goods";
    case "incorrect_quantity": return "Incorrect Invoiced Quantity";
    case "not_ordered": return "Not Ordered";
    default: return reason || "-";
  }
}

function generatedExplanationText(reason: string) {
  switch (reason) {
    case "damaged":
      return "This claim pertains to goods received in damaged condition, rendering them unsuitable for use or sale.";
    case "incorrect_quantity":
      return "This claim addresses discrepancies between the quantity specified in the invoice or PO and the quantity actually delivered.";
    case "not_ordered":
      return "This claim concerns items delivered which were not ordered and should be returned or collected.";
    default:
      return "";
  }
}

function stripHtml(html: string) {
  // Remove HTML tags from rich text for PDF output
  return html.replace(/<\/?[^>]+(>|$)/g, "");
}
