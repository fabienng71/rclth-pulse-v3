
import { PriceListItem, OrganizedItems } from './types';
import * as constants from './constants';

export function organizeItemsByCategory(
  items: PriceListItem[] | undefined,
  categories: any[] | undefined,
  vendors: any[] | undefined
): OrganizedItems {
  if (!items || !categories || !vendors) return {};

  // Create a lookup map for categories and vendors
  const categoryMap = new Map();
  categories.forEach(category => {
    categoryMap.set(category.posting_group, category.description);
  });

  const vendorMap = new Map();
  vendors.forEach(vendor => {
    vendorMap.set(vendor.vendor_code, vendor.vendor_name);
  });

  // Group items by posting_group (category)
  const grouped: OrganizedItems = {};
  
  items.forEach(item => {
    const category = item.posting_group || 'Uncategorized';
    const categoryDesc = categoryMap.get(category) || category;
    
    if (!grouped[category]) {
      grouped[category] = {
        main: [],
        roamBrand: [],
        iconBrand: [],
        sicolyBrand: [],
        moulinVironBrand: [],
        margraBrand: [],
        laMarcaBrand: [],
        moulinDuCalanquetBrand: [],
        huilerieBeaujolaiseBrand: [],
        isignyStemereBrand: [],
        truffleBrand: [],
        mushroomsBrand: [],
        lesFreresMarchand: [],
        caviarPerseus: [],
        huitresDavidHerve: [],
        qwehli: [],
        snacking: []
      };
    }
    
    const enrichedItem = {
      ...item,
      category_description: categoryDesc,
      vendor_name: vendorMap.get(item.vendor_code) || '-'
    };

    // Check if item is a snacking item
    if (item.attribut_1 === 'SNACKING') {
      grouped[category].snacking.push(enrichedItem);
    }
    // Determine whether the item is from special brands/vendors
    else if (item.brand === constants.ROAM_BRAND) {
      grouped[category].roamBrand.push(enrichedItem);
    } else if (item.brand === constants.ICON_BRAND) {
      grouped[category].iconBrand.push(enrichedItem);
    } else if (item.brand === constants.SICOLY_BRAND) {
      grouped[category].sicolyBrand.push(enrichedItem);
    } else if (item.brand === constants.MOULIN_VIRON_BRAND) {
      grouped[category].moulinVironBrand.push(enrichedItem);
    } else if (item.brand === constants.MARGRA_BRAND) {
      grouped[category].margraBrand.push(enrichedItem);
    } else if (item.brand === constants.LA_MARCA_BRAND) {
      grouped[category].laMarcaBrand.push(enrichedItem);
    } else if (item.brand === constants.MOULIN_DU_CALANQUET_BRAND) {
      grouped[category].moulinDuCalanquetBrand.push(enrichedItem);
    } else if (item.brand === constants.HUILERIE_BEAUJOLAISE_BRAND) {
      grouped[category].huilerieBeaujolaiseBrand.push(enrichedItem);
    } else if (item.brand === constants.ISIGNY_STE_MERE_BRAND) {
      grouped[category].isignyStemereBrand.push(enrichedItem);
    } else if (item.brand === constants.TRUFFLE_BRAND) {
      grouped[category].truffleBrand.push(enrichedItem);
    } else if (item.brand === constants.MUSHROOMS_BRAND) {
      grouped[category].mushroomsBrand.push(enrichedItem);
    } else if (item.vendor_code === constants.LES_FRERES_MARCHAND_VENDOR) {
      grouped[category].lesFreresMarchand.push(enrichedItem);
    } else if (item.vendor_code === constants.CAVIAR_PERSEUS_VENDOR) {
      grouped[category].caviarPerseus.push(enrichedItem);
    } else if (item.vendor_code === constants.HUITRES_DAVID_HERVE_VENDOR) {
      grouped[category].huitresDavidHerve.push(enrichedItem);
    } else if (item.vendor_code === constants.QWEHLI_VENDOR) {
      grouped[category].qwehli.push(enrichedItem);
    } else {
      grouped[category].main.push(enrichedItem);
    }
  });

  return grouped;
}

export function sortCategoriesByDescription(
  organizedItems: OrganizedItems,
  categories: any[] | undefined
): string[] {
  if (!categories) return [];

  const categoryMap = new Map();
  categories.forEach(category => {
    categoryMap.set(category.posting_group, category.description);
  });

  return Object.keys(organizedItems).sort((a, b) => {
    const aDesc = categoryMap.get(a) || a;
    const bDesc = categoryMap.get(b) || b;
    return aDesc.localeCompare(bDesc);
  });
}
