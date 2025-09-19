
import { TableCell } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { QuotationItemFormData } from '../../QuotationItemsTable';
import { Input } from '@/components/ui/input';

interface OfferPriceFieldProps {
  item: QuotationItemFormData;
  index: number;
  readOnly: boolean;
  updateItem: (index: number, field: keyof QuotationItemFormData, value: any) => void;
  calculateOfferPrice: (item: QuotationItemFormData) => number;
}

export const OfferPriceField = ({
  item,
  index,
  readOnly,
  updateItem,
  calculateOfferPrice,
}: OfferPriceFieldProps) => {
  const price = calculateOfferPrice(item);
  
  return (
    <TableCell>
      {readOnly ? (
        `THB ${formatCurrency(price)}`
      ) : (
        <div className="flex items-center space-x-2">
          <div className="flex-grow">
            <Input
              type="number"
              value={item.unit_price}
              onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
              disabled={readOnly}
              min={0}
              step={0.01}
              className="w-full min-w-[120px]" // Increased minimum width
            />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-muted-foreground">Disc:</span>
            <Input
              type="number"
              value={item.discount_percent}
              onChange={(e) => updateItem(index, 'discount_percent', Number(e.target.value))}
              disabled={readOnly}
              min={0}
              max={100}
              step={0.1}
              className="w-20 h-10 text-xs"
            />
            <span className="text-xs">%</span>
          </div>
        </div>
      )}
    </TableCell>
  );
};
