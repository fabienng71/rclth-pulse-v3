
import { jsPDF } from "jspdf";

/**
 * Adds document metadata and header to the PDF
 * @param doc The jsPDF document
 * @returns Y position after the header section
 */
export const addDocumentHeader = (doc: jsPDF): number => {
  // Set the title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Price List", 14, 35); // Moved down to make room for logo
  
  // Add date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated: ${currentDate}`, 14, 41); // Moved down to make room for logo

  // Return starting Y position for content
  return 50;
};

/**
 * Gets the category name from its code
 * @param code Category code
 * @param categories Categories data
 * @returns Category name
 */
export const getCategoryName = (code: string, categories: any[] | undefined): string => {
  if (!categories) return code;
  const category = categories.find((c) => c.posting_group === code);
  return category?.description || code;
};
