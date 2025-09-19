
import { QuotationItemFormData } from '../QuotationItemsTable';

interface QuotationItemsFooterProps {
  items: QuotationItemFormData[];
  calculateLineTotal: (item: QuotationItemFormData) => number;
}

const formatCurrency = (amount: number = 0) => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
};

export const QuotationItemsFooter = ({ items, calculateLineTotal }: QuotationItemsFooterProps) => {
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  };
  
  // Calculate subtotal and total discount
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };
  
  const calculateTotalDiscount = () => {
    return calculateSubtotal() - calculateTotal();
  };
  
  const subtotal = calculateSubtotal();
  const totalDiscount = calculateTotalDiscount();
  const total = calculateTotal();
  
  if (items.length === 0) {
    return null;
  }
  
  return (
    <div className="flex justify-end mt-4">
      <div className="w-[300px] space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span>THB {formatCurrency(subtotal)}</span>
        </div>
        
        {totalDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Savings:</span>
            <span>-THB {formatCurrency(totalDiscount)}</span>
          </div>
        )}
        
        <div className="flex justify-between pt-2 border-t">
          <span className="font-medium">Total:</span>
          <span className="font-bold">THB {formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};
