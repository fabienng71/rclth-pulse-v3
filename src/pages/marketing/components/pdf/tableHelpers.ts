
import autoTable from "jspdf-autotable";
import { PriceListItem } from "@/hooks/priceList/types";
import { jsPDF } from "jspdf";

/**
 * Adds a section of items to the PDF document
 * @param doc PDF document
 * @param sectionTitle Section title
 * @param items Items to add
 * @param startY Starting Y position
 * @returns New Y position after adding the section
 */
export function addItemsSection(
  doc: jsPDF,
  sectionTitle: string,
  items: PriceListItem[],
  startY: number
): number {
  // Add section title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(sectionTitle, 16, startY);

  // Calculate table data
  const tableData = items.map((item) => [
    item.item_code || "",
    item.description || "",
    item.base_unit_code || "",
    item.unit_price != null ? item.unit_price.toFixed(0) : "-"
  ]);

  // Add table to document
  autoTable(doc, {
    startY: startY + 4,
    head: [["Item Code", "Description", "Unit", "Price"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [50, 50, 50],
      fontStyle: "bold",
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 20 },
      3: { cellWidth: 25, halign: "right" }
    },
    margin: { left: 14, right: 14 }
  });

  // Return the new Y position
  return (doc as any).lastAutoTable.finalY + 10;
}
