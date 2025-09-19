
import { useNavigate } from 'react-router-dom';
import { useQuotations } from '@/hooks/useQuotations';
import { QuotationItemFormData } from '@/components/quotations/QuotationItemsTable';
import { QuotationUpdate, QuotationWithItems } from '@/types/quotations';
import { FormData } from '@/components/quotations/types';

export const useQuotationUpdate = () => {
  const navigate = useNavigate();
  const { updateQuotation } = useQuotations();
  
  const updateQuotationWithItems = async (
    data: FormData,
    existingQuotation: QuotationWithItems
  ) => {
    // If it's a lead, set customer_code to null
    const customerCode = data.is_lead ? null : (data.customer_code === 'no_customer' ? null : data.customer_code);
    
    // Update existing quotation
    const updatedQuotation: QuotationUpdate = {
      title: data.title,
      customer_code: customerCode, // Removed the || '' to make sure null stays null
      customer_name: data.is_lead ? '' : (data.customer_name || ''),
      customer_address: data.is_lead ? '' : (data.customer_address || ''),
      salesperson_code: data.salesperson_code || '',
      validity_days: data.validity_days,
      payment_terms: data.payment_terms || '',
      notes: data.notes || '',
      status: data.status as any,
      updated_at: new Date().toISOString(),
      is_lead: data.is_lead || false,
      lead_id: data.lead_id || null,
      lead_name: data.lead_name || '',
    };
    
    // Update the quotation and return the result
    const result = await updateQuotation.mutateAsync({
      id: existingQuotation.id,
      quotation: updatedQuotation,
    });
    
    return result;
  };

  return {
    updateQuotationWithItems,
  };
};
