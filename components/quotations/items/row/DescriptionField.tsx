
import { TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface DescriptionFieldProps {
  description: string;
  readOnly: boolean;
  onChange: (value: string) => void;
}

export const DescriptionField = ({
  description,
  readOnly,
  onChange,
}: DescriptionFieldProps) => {
  return (
    <TableCell>
      {readOnly ? (
        description
      ) : (
        <Input
          value={description}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Description"
          disabled={readOnly}
          required
        />
      )}
    </TableCell>
  );
};
