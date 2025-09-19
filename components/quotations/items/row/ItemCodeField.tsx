
import { TableCell } from '@/components/ui/table';

interface ItemCodeFieldProps {
  itemCode: string | null | undefined;
  readOnly: boolean;
  isLoading?: boolean;
}

export const ItemCodeField = ({ 
  itemCode, 
  readOnly, 
  isLoading 
}: ItemCodeFieldProps) => {
  return (
    <TableCell>
      {itemCode || 'N/A'}
    </TableCell>
  );
};
