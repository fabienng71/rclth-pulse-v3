
import {
  Table,
  TableBody,
} from '@/components/ui/table';
import { QuotationItemsHeader } from './items/QuotationItemsHeader';
import { QuotationItemsEmpty } from './items/QuotationItemsEmpty';
import { QuotationItemRow } from './items/QuotationItemRow';
import { QuotationItemsFooter } from './items/QuotationItemsFooter';
import { useQuotationItemsTable } from '@/hooks/useQuotationItemsTable';
import { ItemSearch } from './ItemSearch';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export type QuotationItemFormData = {
  id?: string;
  item_code?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  unit_of_measure?: string | null;
};

interface QuotationItemsTableProps {
  items: QuotationItemFormData[];
  onChange: (items: QuotationItemFormData[]) => void;
  readOnly?: boolean;
}

export const QuotationItemsTable = ({
  items,
  onChange,
  readOnly = false,
}: QuotationItemsTableProps) => {
  const {
    addNewItem,
    updateItem,
    removeItem,
    calculateLineTotal,
    selectItem
  } = useQuotationItemsTable(items, onChange);
  
  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ItemSearch 
              onSelectItem={(item) => selectItem(item)}
              disabled={readOnly}
              placeholder="Search for an item to add..."
            />
          </div>
          <Button 
            type="button" 
            onClick={addNewItem} 
            disabled={readOnly}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Empty Row
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <QuotationItemsHeader readOnly={readOnly} />
          
          {items.length === 0 ? (
            <QuotationItemsEmpty colSpan={readOnly ? 6 : 7} />
          ) : (
            <TableBody>
              {items.map((item, index) => (
                <QuotationItemRow
                  key={index}
                  item={item}
                  index={index}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  calculateLineTotal={calculateLineTotal}
                  readOnly={readOnly}
                  isLoading={false}
                />
              ))}
            </TableBody>
          )}
        </Table>
      </div>
      
      <QuotationItemsFooter items={items} calculateLineTotal={calculateLineTotal} />
    </div>
  );
};
