
import { TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

interface PriceFieldsProps {
  listPrice: number | null | undefined;
  unitPrice: number;
  readOnly: boolean;
  onChangeListPrice: (value: number) => void;
  onChangeUnitPrice: (value: number) => void;
}

export const PriceFields = ({
  listPrice,
  unitPrice,
  readOnly,
  onChangeListPrice,
  onChangeUnitPrice,
}: PriceFieldsProps) => {
  return (
    <>
      <TableCell>
        {readOnly ? (
          listPrice ? `THB ${formatCurrency(listPrice)}` : 'N/A'
        ) : (
          <Input
            type="number"
            value={listPrice || 0}
            onChange={(e) => onChangeListPrice(Number(e.target.value))}
            disabled={readOnly}
            step={0.01}
          />
        )}
      </TableCell>
      <TableCell>
        {readOnly ? (
          `THB ${formatCurrency(unitPrice)}`
        ) : (
          <Input
            type="number"
            value={unitPrice}
            onChange={(e) => onChangeUnitPrice(Number(e.target.value))}
            disabled={readOnly}
            required
            min={0}
            step={0.01}
          />
        )}
      </TableCell>
    </>
  );
};
