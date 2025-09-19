
import { format, addDays } from 'date-fns';
import { QuotationWithItems } from '@/types/quotations';

interface QuotationDetailsInfoProps {
  quotation: QuotationWithItems;
}

export const QuotationDetailsInfo = ({ quotation }: QuotationDetailsInfoProps) => {
  const validUntil = quotation.created_at
    ? format(
        addDays(new Date(quotation.created_at), quotation.validity_days),
        'MMMM dd, yyyy'
      )
    : 'N/A';

  return (
    <div className="space-y-3 flex flex-col items-end text-right">
      <div>
        <h2 className="font-semibold text-lg mb-2">Quotation Details</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="text-muted-foreground">Date:</div>
          <div className="font-medium">
            {quotation.created_at
              ? format(new Date(quotation.created_at), 'MMMM dd, yyyy')
              : 'N/A'}
          </div>
          
          <div className="text-muted-foreground">Valid until:</div>
          <div className="font-medium">{validUntil}</div>
          
          <div className="text-muted-foreground">Payment terms:</div>
          <div className="font-medium">
            {quotation.payment_terms || 'Not specified'}
          </div>
          
          <div className="text-muted-foreground">Salesperson:</div>
          <div className="font-medium">
            {quotation.salesperson_name || quotation.salesperson_code || 'Not assigned'}
          </div>
        </div>
      </div>
    </div>
  );
};
