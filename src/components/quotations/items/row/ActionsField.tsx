
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface ActionsFieldProps {
  index: number;
  readOnly: boolean;
  onRemove: (index: number) => void;
}

export const ActionsField = ({
  index,
  readOnly,
  onRemove,
}: ActionsFieldProps) => {
  if (readOnly) {
    return null;
  }

  return (
    <TableCell>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        disabled={readOnly}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </TableCell>
  );
};
