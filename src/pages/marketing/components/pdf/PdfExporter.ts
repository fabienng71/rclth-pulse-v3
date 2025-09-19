
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { OrganizedItems } from "@/hooks/priceList/types";
import { addLogoToPdf } from "./logoHelpers";
import { addDocumentHeader, getCategoryName } from "./documentHelpers";
import { addItemsSection } from "./tableHelpers";
import { createBrandSections, processBrandSections } from "./brandSections";

// Add necessary types for jsPDF and autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

/**
 * Exports the price list to a PDF document
 * @param organizedItems Organized price list items
 * @param categoryOrder Order of categories
 * @param categories Categories data
 * @param formatPrice Price formatting function
 */
export const exportPriceListToPdf = async (
  organizedItems: OrganizedItems,
  categoryOrder: string[],
  categories: any[] | undefined,
  formatPrice: (price: number | null) => string
): Promise<void> => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add logo to the PDF
  await addLogoToPdf(doc);
  
  // Add document header and get starting Y position
  let yPosition = addDocumentHeader(doc);
  
  const pageHeight = doc.internal.pageSize.height;

  // Process each category
  for (const categoryCode of categoryOrder) {
    const categoryItems = organizedItems[categoryCode];
    if (!categoryItems) continue;

    // Check if we need a new page for this category
    if (yPosition + 15 > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }

    // Add category header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(getCategoryName(categoryCode, categories), 14, yPosition);
    yPosition += 8;

    // Add main items section
    if (categoryItems.main && categoryItems.main.length > 0) {
      yPosition = addItemsSection(doc, "Main Items", categoryItems.main, yPosition);
    }

    // Create and process brand sections
    const brandSections = createBrandSections(categoryItems);
    yPosition = processBrandSections(doc, brandSections, yPosition);

    // Add some extra space between categories
    yPosition += 5;
  }

  // Save the PDF file
  doc.save("price-list.pdf");
};
