
import { TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface QuantityFieldProps {
  quantity: number;
  readOnly: boolean;
  onChange: (value: number) => void;
}

export const QuantityField = ({
  quantity,
  readOnly,
  onChange,
}: QuantityFieldProps) => {
  return (
    <TableCell>
      {readOnly ? (
        quantity
      ) : (
        <Input
          type="number"
          value={quantity}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={readOnly}
          required
          min={1}
          step={1}
        />
      )}
    </TableCell>
  );
};
