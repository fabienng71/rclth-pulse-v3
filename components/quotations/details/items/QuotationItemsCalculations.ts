
import { QuotationItem } from "@/types/quotations";

export const calculateOfferPrice = (item: QuotationItem) => {
  if (!item.unit_price) return 0;
  const price = Number(item.unit_price);
  const discountPercent = Number(item.discount_percent || 0);
  return price * (1 - discountPercent / 100);
};

export const calculateLineTotal = (item: QuotationItem) => {
  if (!item.quantity || !item.unit_price) return 0;
  const quantity = Number(item.quantity);
  const unitPrice = Number(item.unit_price);
  const discountPercent = Number(item.discount_percent || 0);
  
  return quantity * unitPrice * (1 - discountPercent / 100);
};

export const calculateTotal = (items: QuotationItem[]) => {
  return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
};
