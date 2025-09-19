
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { shipmentFormSchema, ShipmentFormValues } from '@/types/shipment';
import VendorSection from './form-sections/VendorSection';
import TransportSection from './form-sections/TransportSection';
import ItemsSection from './form-sections/ItemsSection';

interface ShipmentCreationFormProps {
  onSubmit: (values: ShipmentFormValues & { items: { item_code: string, description: string, quantity: number, base_unit_code?: string, direct_unit_cost?: number }[] }) => void;
  isLoading?: boolean;
}

const ShipmentCreationForm = ({ onSubmit, isLoading = false }: ShipmentCreationFormProps) => {
  const [selectedItems, setSelectedItems] = useState<{ item_code: string, description: string, quantity: number, base_unit_code?: string, direct_unit_cost?: number }[]>([]);

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      vendor_code: "",
      vendor_name: "",
      freight_forwarder: "",
      transport_mode: "sea",
      shipment_type: "Dry",
      etd: undefined,
      eta: undefined,
    },
  });

  const handleVendorSelect = (vendor: { vendor_code: string, vendor_name: string }) => {
    form.setValue('vendor_code', vendor.vendor_code);
    form.setValue('vendor_name', vendor.vendor_name);
  };

  const handleAddItem = (item: { item_code: string, description: string, base_unit_code?: string }) => {
    console.log('Adding item:', item);
    
    // Always add the item, allowing duplicates - each entry is treated as a separate line item
    const newItem = { ...item, quantity: 1 };
    console.log('Adding new item to the list (allowing duplicates)');
    setSelectedItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (itemCode: string) => {
    console.log('Removing item:', itemCode);
    // Remove only the first occurrence of the item code to handle duplicates properly
    setSelectedItems(prev => {
      const indexToRemove = prev.findIndex(item => item.item_code === itemCode);
      if (indexToRemove === -1) return prev;
      
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleUpdateQuantity = (itemCode: string, quantity: number) => {
    console.log('Updating quantity for item:', itemCode, 'to', quantity);
    // Update the first occurrence of the item code
    setSelectedItems(prev => {
      const indexToUpdate = prev.findIndex(item => item.item_code === itemCode);
      if (indexToUpdate === -1) return prev;
      
      return prev.map((item, index) => 
        index === indexToUpdate ? { ...item, quantity } : item
      );
    });
  };

  const handleUpdateBaseUnitCode = (itemCode: string, base_unit_code: string) => {
    console.log('Updating base unit code for item:', itemCode, 'to', base_unit_code);
    // Update the first occurrence of the item code
    setSelectedItems(prev => {
      const indexToUpdate = prev.findIndex(item => item.item_code === itemCode);
      if (indexToUpdate === -1) return prev;
      
      return prev.map((item, index) => 
        index === indexToUpdate ? { ...item, base_unit_code } : item
      );
    });
  };

  const handleUpdateDirectUnitCost = (itemCode: string, direct_unit_cost: number) => {
    console.log('Updating direct unit cost for item:', itemCode, 'to', direct_unit_cost);
    // Update the first occurrence of the item code
    setSelectedItems(prev => {
      const indexToUpdate = prev.findIndex(item => item.item_code === itemCode);
      if (indexToUpdate === -1) return prev;
      
      return prev.map((item, index) => 
        index === indexToUpdate ? { ...item, direct_unit_cost } : item
      );
    });
  };

  const handleFormSubmit = async (data: ShipmentFormValues) => {
    console.log('Form submission with data:', data);
    console.log('Selected items:', selectedItems);
    
    const submission = {
      ...data,
      items: selectedItems
    };
    
    onSubmit(submission);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <VendorSection form={form} onVendorSelect={handleVendorSelect} />
        
        <TransportSection form={form} />
        
        <ItemsSection 
          selectedItems={selectedItems}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateBaseUnitCode={handleUpdateBaseUnitCode}
          onUpdateDirectUnitCost={handleUpdateDirectUnitCost}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? "Creating..." : "Create Shipment"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ShipmentCreationForm;
