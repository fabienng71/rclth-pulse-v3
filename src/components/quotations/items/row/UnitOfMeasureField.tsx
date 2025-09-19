
import { TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface UnitOfMeasureFieldProps {
  unitOfMeasure: string | null | undefined;
  readOnly: boolean;
  onChange: (value: string) => void;
}

export const UnitOfMeasureField = ({
  unitOfMeasure,
  readOnly,
  onChange,
}: UnitOfMeasureFieldProps) => {
  return (
    <TableCell>
      {readOnly ? (
        unitOfMeasure || 'N/A'
      ) : (
        <Input
          value={unitOfMeasure || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="UoM"
          disabled={readOnly}
        />
      )}
    </TableCell>
  );
};
