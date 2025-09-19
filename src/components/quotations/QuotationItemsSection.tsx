
import { Label } from '@/components/ui/label';
import { QuotationItemFormData, QuotationItemsTable } from './QuotationItemsTable';

interface QuotationItemsSectionProps {
  items: QuotationItemFormData[];
  onChange: (items: QuotationItemFormData[]) => void;
  readOnly?: boolean;
}

export const QuotationItemsSection = ({ 
  items, 
  onChange, 
  readOnly = false 
}: QuotationItemsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label>Quotation Items</Label>
        <QuotationItemsTable
          items={items}
          onChange={onChange}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};
