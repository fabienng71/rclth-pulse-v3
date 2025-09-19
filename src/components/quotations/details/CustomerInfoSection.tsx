
import { QuotationWithItems } from '@/types/quotations';
import { Badge } from '@/components/ui/badge';

interface CustomerInfoSectionProps {
  quotation: QuotationWithItems;
}

export const CustomerInfoSection = ({ quotation }: CustomerInfoSectionProps) => {
  // Determine if we're dealing with a lead
  const isLead = quotation.is_lead;

  return (
    <div>
      <h2 className="font-semibold text-lg mb-2">
        {isLead ? 'Lead Information' : 'Customer Information'}
      </h2>
      
      {isLead ? (
        // Display lead information
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{quotation.lead_name}</p>
            <Badge className="bg-purple-500">Lead</Badge>
          </div>
          {/* We could add more lead details here if needed */}
        </div>
      ) : (
        // Display customer information
        <>
          {quotation.customer_name ? (
            <div className="space-y-1">
              <p className="font-medium">{quotation.customer_name}</p>
              {quotation.customer_address && (
                <p className="whitespace-pre-line text-muted-foreground">
                  {quotation.customer_address}
                </p>
              )}
            </div>
          ) : quotation.customer_code ? (
            <p className="text-muted-foreground">
              Customer code: {quotation.customer_code}
            </p>
          ) : (
            <p className="text-muted-foreground">No customer information</p>
          )}
        </>
      )}
    </div>
  );
};
