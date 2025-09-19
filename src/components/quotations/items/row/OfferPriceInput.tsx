
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface OfferPriceInputProps {
  unitPrice: number;
  discountPercent: number;
  index: number;
  readOnly?: boolean;
  updateItem: (index: number, field: string, value: any) => void;
}

export const OfferPriceInput = ({
  unitPrice,
  discountPercent,
  index,
  readOnly = false,
  updateItem,
}: OfferPriceInputProps) => {
  // Use local state to manage the offer price input
  const [offerPriceInput, setOfferPriceInput] = useState<string>('');
  // Track if user is currently editing the field
  const isUserEditing = useRef(false);
  
  // Calculate the offer price based on unit price and discount
  const calculateOfferPrice = () => {
    if (!unitPrice) return 0;
    const calculatedPrice = unitPrice * (1 - (discountPercent || 0) / 100);
    return calculatedPrice;
  };

  // Update local state when the item changes (but not during user input)
  useEffect(() => {
    if (!isUserEditing.current) {
      const calculatedPrice = calculateOfferPrice();
      setOfferPriceInput(calculatedPrice.toFixed(2));
    }
  }, [unitPrice, discountPercent]);

  // Update discount percentage when offer price changes
  const handleOfferPriceChange = (inputValue: string) => {
    // Flag that user is actively editing
    isUserEditing.current = true;
    setOfferPriceInput(inputValue);
    
    const value = parseFloat(inputValue) || 0;
    
    if (!unitPrice || unitPrice === 0) {
      updateItem(index, 'discount_percent', 0);
    } else {
      // Calculate discount as a percentage
      const discount = Math.max(0, Math.min(100, ((unitPrice - value) / unitPrice) * 100));
      updateItem(index, 'discount_percent', Number(discount.toFixed(2)));
    }
  };

  // Handle focus and blur events to manage editing state
  const handleFocus = () => {
    isUserEditing.current = true;
  };

  const handleBlur = () => {
    isUserEditing.current = false;
    // Format the value after the user finishes editing
    const calculatedPrice = calculateOfferPrice();
    setOfferPriceInput(calculatedPrice.toFixed(2));
  };

  // For displaying calculated value in read-only mode
  const offerPrice = calculateOfferPrice();

  if (readOnly) {
    return `THB ${offerPrice.toFixed(2)}`;
  }

  return (
    <Input
      type="number"
      value={offerPriceInput}
      onChange={(e) => handleOfferPriceChange(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={readOnly}
      min={0}
      max={unitPrice || 0}
      step={0.01}
    />
  );
};
