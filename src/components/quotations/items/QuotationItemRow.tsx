
import { TableCell, TableRow } from '@/components/ui/table';
import { QuotationItemFormData } from '../QuotationItemsTable';
import { ItemCodeField } from './row/ItemCodeField';
import { DescriptionField } from './row/DescriptionField';
import { QuantityField } from './row/QuantityField';
import { UnitOfMeasureField } from './row/UnitOfMeasureField';
import { OfferPriceField } from './row/OfferPriceField';
import { TotalField } from './row/TotalField';
import { ActionsField } from './row/ActionsField';

interface QuotationItemRowProps {
  item: QuotationItemFormData;
  index: number;
  updateItem: (index: number, field: keyof QuotationItemFormData, value: any) => void;
  removeItem: (index: number) => void;
  calculateLineTotal: (item: QuotationItemFormData) => number;
  readOnly?: boolean;
  isLoading?: boolean;
}

export const QuotationItemRow = ({
  item,
  index,
  updateItem,
  removeItem,
  calculateLineTotal,
  readOnly = false,
  isLoading = false,
}: QuotationItemRowProps) => {
  // Calculate the offer price based on unit price and discount
  const calculateOfferPrice = (item: QuotationItemFormData) => {
    if (!item.unit_price) return 0;
    const calculatedPrice = item.unit_price * (1 - (item.discount_percent || 0) / 100);
    return calculatedPrice;
  };

  return (
    <TableRow>
      {!readOnly && <TableCell>{index + 1}</TableCell>}
      
      <ItemCodeField 
        itemCode={item.item_code}
        readOnly={readOnly}
        isLoading={isLoading}
      />
      
      <DescriptionField
        description={item.description}
        readOnly={readOnly}
        onChange={(value) => updateItem(index, 'description', value)}
      />
      
      <QuantityField
        quantity={item.quantity}
        readOnly={readOnly}
        onChange={(value) => updateItem(index, 'quantity', value)}
      />
      
      <UnitOfMeasureField
        unitOfMeasure={item.unit_of_measure}
        readOnly={readOnly}
        onChange={(value) => updateItem(index, 'unit_of_measure', value)}
      />
      
      <OfferPriceField
        item={item}
        index={index}
        readOnly={readOnly}
        updateItem={updateItem}
        calculateOfferPrice={calculateOfferPrice}
      />
      
      <TotalField 
        item={item}
        calculateLineTotal={calculateLineTotal}
      />
      
      <ActionsField 
        index={index}
        readOnly={readOnly}
        onRemove={removeItem}
      />
    </TableRow>
  );
};
