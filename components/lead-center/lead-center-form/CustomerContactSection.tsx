import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { LeadCenterFormData } from './leadCenterSchema';
import { CustomerContactSelector } from '../CustomerContactSelector';
import { Contact } from '@/types/contact';
import { Customer } from '@/hooks/useCustomersData';

interface CustomerContactSectionProps {
  form: UseFormReturn<LeadCenterFormData>;
  handleCustomerChange: (customer: Customer | null) => Promise<void>;
  handleContactChange: (contact: Contact | null) => void;
}

export const CustomerContactSection: React.FC<CustomerContactSectionProps> = ({
  form,
  handleCustomerChange,
  handleContactChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Customer & Contact Information</h3>
      
      <div className="space-y-2">
        <Label>Customer & Contact</Label>
        <CustomerContactSelector
          selectedCustomerId={form.watch('customer_id') || ''}
          selectedContactId={form.watch('contact_id') || ''}
          onCustomerChange={handleCustomerChange}
          onContactChange={handleContactChange}
          placeholder="Search for customer or contact..."
        />
      </div>
    </div>
  );
};