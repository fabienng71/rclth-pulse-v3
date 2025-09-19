
export interface PriceListItem {
  item_code: string;
  description: string | null;
  base_unit_code: string | null;
  unit_price: number | null;
  posting_group: string | null;
  vendor_code: string | null;
  vendor_name?: string;
  category_description?: string;
  pricelist?: boolean;
  brand?: string | null;
  attribut_1?: string | null;
}

export interface OrganizedItems {
  [category: string]: {
    main: PriceListItem[];
    roamBrand: PriceListItem[];
    iconBrand: PriceListItem[];
    sicolyBrand: PriceListItem[];
    moulinVironBrand: PriceListItem[];
    margraBrand: PriceListItem[];
    laMarcaBrand: PriceListItem[];
    moulinDuCalanquetBrand: PriceListItem[];
    huilerieBeaujolaiseBrand: PriceListItem[];
    isignyStemereBrand: PriceListItem[];
    truffleBrand: PriceListItem[];
    mushroomsBrand: PriceListItem[];
    lesFreresMarchand: PriceListItem[];
    caviarPerseus: PriceListItem[];
    huitresDavidHerve: PriceListItem[];
    qwehli: PriceListItem[];
    snacking: PriceListItem[];
  };
}
