
import { useState } from 'react';
import { useCustomersData } from '@/hooks/useCustomersData';

export const useCustomerSelection = (
  initialCustomerCode: string = '', 
  initialCustomerName: string = ''
) => {
  const [customerCode, setCustomerCode] = useState<string>(initialCustomerCode);
  const [customerName, setCustomerName] = useState<string>(initialCustomerName);
  const { customers } = useCustomersData();
  
  // Handle customer selection - ensure both code and name are updated
  const selectCustomer = (code: string, name: string) => {
    console.log('Customer selected:', code, name); // Debug logging
    setCustomerCode(code);
    setCustomerName(name);
  };
  
  // Set selected customer by code only (looks up name)
  const setSelectedCustomerByCode = (customerCode: string) => {
    console.log('Selecting customer by code:', customerCode); // Debug logging
    const selectedCustomer = customers.find(c => c.customer_code === customerCode);
    
    if (selectedCustomer) {
      console.log('Found customer:', selectedCustomer); // Debug logging
      setCustomerCode(selectedCustomer.customer_code);
      setCustomerName(selectedCustomer.customer_name);
    } else {
      console.log('Customer not found for code:', customerCode);
    }
  };
  
  // Clear customer selection
  const clearCustomer = () => {
    setCustomerCode('');
    setCustomerName('');
  };
  
  // Debug logging to trace state
  console.log('Customer selection state:', { customerCode, customerName });
  
  return {
    customerCode,
    customerName,
    selectCustomer,
    setSelectedCustomerByCode,
    clearCustomer
  };
};
