
import { PriceListItem } from "@/hooks/priceList/types";
import { jsPDF } from "jspdf";
import { addItemsSection } from "./tableHelpers";

/**
 * Definition of brand sections for the PDF
 */
export interface BrandSection {
  title: string;
  items: PriceListItem[];
}

/**
 * Creates brand sections from category items
 * @param categoryItems Category items object
 * @returns Array of brand sections
 */
export const createBrandSections = (categoryItems: any): BrandSection[] => {
  return [
    { title: "SNACKING Products", items: categoryItems.snacking || [] },
    { title: "ROAM Brand Products", items: categoryItems.roamBrand || [] },
    { title: "ICON Brand Products", items: categoryItems.iconBrand || [] },
    { title: "SICOLY Brand Products", items: categoryItems.sicolyBrand || [] },
    { title: "MOULIN VIRON Brand Products", items: categoryItems.moulinVironBrand || [] },
    { title: "MARGRA Brand Products", items: categoryItems.margraBrand || [] },
    { title: "LA MARCA Brand Products", items: categoryItems.laMarcaBrand || [] },
    { title: "MOULIN DU CALANQUET Brand Products", items: categoryItems.moulinDuCalanquetBrand || [] },
    { title: "HUILERIE BEAUJOLAISE Brand Products", items: categoryItems.huilerieBeaujolaiseBrand || [] },
    { title: "ISIGNY STE MERE Brand Products", items: categoryItems.isignyStemereBrand || [] },
    { title: "TRUFFLE Brand Products", items: categoryItems.truffleBrand || [] },
    { title: "MUSHROOMS Brand Products", items: categoryItems.mushroomsBrand || [] },
    { title: "Les Frères Marchand Products", items: categoryItems.lesFreresMarchand || [] },
    { title: "Caviar Perseus Products", items: categoryItems.caviarPerseus || [] },
    { title: "Huîtres David Hervé Products", items: categoryItems.huitresDavidHerve || [] },
    { title: "Qwehli Products", items: categoryItems.qwehli || [] }
  ];
};

/**
 * Process all brand sections for a category
 * @param doc PDF document
 * @param sections Brand sections
 * @param yPosition Current Y position
 * @returns New Y position after all sections
 */
export const processBrandSections = (
  doc: jsPDF, 
  sections: BrandSection[], 
  yPosition: number
): number => {
  let currentY = yPosition;
  
  // Process each brand section
  for (const section of sections) {
    if (section.items && section.items.length > 0) {
      currentY = addItemsSection(doc, section.title, section.items, currentY);
    }
  }
  
  return currentY;
};
