
import { useNavigate } from 'react-router-dom';
import { useQuotations } from '@/hooks/useQuotations';
import { useAuthStore } from '@/stores/authStore';
import { QuotationItemFormData } from '@/components/quotations/QuotationItemsTable';
import { QuotationInsert } from '@/types/quotations';
import { FormData } from '@/components/quotations/types';

export const useQuotationCreate = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const { createQuotation } = useQuotations();
  
  // Generate a unique quote number using current timestamp
  const generateQuoteNumber = () => {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `Q-${timestamp.toString().slice(-6)}-${randomPart}`;
  };
  
  const createQuotationWithItems = async (data: FormData, items: QuotationItemFormData[]) => {
    // If it's a lead, set customer_code to null
    const customerCode = data.is_lead ? null : (data.customer_code === 'no_customer' ? null : data.customer_code);
    
    const newQuotation: QuotationInsert = {
      title: data.title,
      customer_code: customerCode, // Removed the || '' to make sure null stays null
      customer_name: data.is_lead ? '' : (data.customer_name || ''),
      customer_address: data.is_lead ? '' : (data.customer_address || ''),
      salesperson_code: data.salesperson_code || '',
      validity_days: data.validity_days,
      payment_terms: data.payment_terms || '',
      notes: data.notes || '',
      status: data.status as any,
      created_by: userId || undefined,
      quote_number: generateQuoteNumber(), // Add a unique quote number
      archive: false, // Add the archive property with default false value
      is_lead: data.is_lead || false,
      lead_id: data.lead_id || null,
      lead_name: data.lead_name || '',
    };
    
    // Create the quotation and return the result
    const result = await createQuotation.mutateAsync(newQuotation);
    return result;
  };

  return {
    createQuotationWithItems,
  };
};
