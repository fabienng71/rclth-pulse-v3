
import { useQuotationFormState } from './quotation/useQuotationFormState';
import { useQuotationSubmit } from './quotation/useQuotationSubmit';
import { QuotationWithItems } from '@/types/quotations';
import { FormData } from '@/components/quotations/types';

export const useQuotationForm = (existingQuotation?: QuotationWithItems, isEdit = false) => {
  const { form, items, setItems, handleCustomerChange } = useQuotationFormState(existingQuotation);
  const { onSubmit: submitHandler } = useQuotationSubmit(existingQuotation, isEdit);
  
  // Wrapped submit handler to pass both form data and items
  const onSubmit = (data: FormData) => {
    return submitHandler(data, items);
  };

  return {
    form,
    items,
    setItems,
    handleCustomerChange,
    onSubmit,
  };
};
