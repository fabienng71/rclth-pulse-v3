
import { QuotationItemFormData } from '@/components/quotations/QuotationItemsTable';

interface QuotationItemsActionsProps {
  onAddItem: () => void;
  readOnly?: boolean;
}

export const QuotationItemsActions = ({ 
  onAddItem, 
  readOnly = false 
}: QuotationItemsActionsProps) => {
  return null; // Remove all rendering
};

