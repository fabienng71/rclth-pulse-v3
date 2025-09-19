
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SalespersonFieldProps {
  value: string;
}

export const SalespersonField = ({ value }: SalespersonFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>Salesperson</Label>
      <Input
        value={value}
        disabled
        className="bg-muted"
      />
    </div>
  );
};
