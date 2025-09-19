
import { QuotationItemFormData } from '../QuotationItemsTable';

interface QuotationTaxesProps {
  items: QuotationItemFormData[];
  calculateLineTotal: (item: QuotationItemFormData) => number;
  taxRate?: number;
}

export const QuotationTaxes = ({ items, calculateLineTotal, taxRate = 0 }: QuotationTaxesProps) => {
  if (taxRate === 0) return null;
  
  const subtotal = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  const taxAmount = subtotal * (taxRate / 100);
  
  return (
    <div className="flex justify-end mt-2">
      <div className="w-[300px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax ({taxRate}%):</span>
          <span>{taxAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
