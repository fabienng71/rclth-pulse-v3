export interface BatchEditData {
  description?: string;
  posting_group?: string;
  base_unit_code?: string;
  unit_price?: number;
  vendor_code?: string;
  brand?: string;
  attribut_1?: string;
  pricelist?: boolean;
}

export interface BatchEditOptions {
  updateDescription: boolean;
  updatePostingGroup: boolean;
  updateBaseUnitCode: boolean;
  updateUnitPrice: boolean;
  updateVendorCode: boolean;
  updateBrand: boolean;
  updateAttribut1: boolean;
  updatePricelist: boolean;
}