import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLeaveManagement } from '@/hooks/useLeaveManagement';
import { LeaveFormData } from '@/types/leave';
import { supabase } from '@/lib/supabase';

const formSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  leave_type: z.enum(['Annual', 'Sick Leave', 'Business Leave'] as const),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return startDate >= today;
}, {
  message: "Start date cannot be in the past",
  path: ["start_date"],
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  
  return endDate >= startDate;
}, {
  message: "End date must be after start date",
  path: ["end_date"],
});

export const useLeaveRequestForm = (onSuccess?: () => void) => {
  const { balance, submitRequest, isSubmitting } = useLeaveManagement();
  const [calculatedDays, setCalculatedDays] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastCalculatedKey, setLastCalculatedKey] = useState<string | null>(null);

  // Direct calculation function to avoid dependency loops
  const calculateBusinessDays = async (startDate: string, endDate: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('calculate_business_days', {
        start_date: startDate,
        end_date: endDate
      });

      if (error) {
        // Fallback to simple calculation
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
      }
      
      return data || 0;
    } catch (error) {
      // Fallback calculation
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
  };

  const form = useForm<LeaveFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start_date: '',
      end_date: '',
      leave_type: 'Annual',
      reason: '',
    },
  });

  const watchedValues = form.watch(['start_date', 'end_date', 'leave_type']);
  const [startDate, endDate, leaveType] = watchedValues;

  // Calculate days when dates change
  useEffect(() => {
    // Reset if dates are invalid
    if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
      setCalculatedDays(null);
      setValidationError(null);
      setLastCalculatedKey(null);
      return;
    }

    // Create a unique key for this calculation to avoid duplicates
    const calculationKey = `${startDate}-${endDate}`;
    
    // Don't recalculate if we already have the result for the same dates
    if (lastCalculatedKey === calculationKey) {
      return;
    }

    const calculateDays = async () => {
      setIsCalculating(true);
      setValidationError(null);
      
      try {
        console.log(`📅 Calculating business days for ${calculationKey}...`);
        const days = await calculateBusinessDays(startDate, endDate);
        setCalculatedDays(days);
        setLastCalculatedKey(calculationKey);
        console.log(`✅ Calculated ${days} business days`);
      } catch (error) {
        console.error('Error calculating days:', error);
        setCalculatedDays(null);
        setLastCalculatedKey(null);
      } finally {
        setIsCalculating(false);
      }
    };

    // Debounce the calculation to avoid rapid calls
    const timeoutId = setTimeout(calculateDays, 500);
    
    return () => clearTimeout(timeoutId);
  }, [startDate, endDate]);

  // Separate effect for balance validation to avoid infinite loops
  useEffect(() => {
    if (calculatedDays !== null && balance && leaveType) {
      // Only validate credits for Annual Leave (Sick and Business are unlimited)
      if (leaveType === 'Annual') {
        const availableCredit = balance.al_credit || 0;
        if (calculatedDays > availableCredit) {
          setValidationError(`Insufficient ${leaveType} credits. You have ${availableCredit} days available.`);
        } else {
          setValidationError(null);
        }
      } else {
        // Sick Leave and Business Leave are unlimited, no validation needed
        setValidationError(null);
      }
    }
  }, [calculatedDays, balance, leaveType]);

  const onSubmit = async (data: LeaveFormData) => {
    if (validationError) {
      return;
    }

    console.log('📤 Submitting leave request:', data);
    
    const result = await submitRequest(data);
    
    console.log('📨 Submit result:', result);
    
    if (result.success) {
      form.reset();
      setCalculatedDays(null);
      setValidationError(null);
      setLastCalculatedKey(null);
      
      // Force refresh the parent component data
      onSuccess?.();
      
      // Also trigger a manual refresh of the hook data
      window.dispatchEvent(new CustomEvent('refreshLeaveData'));
    }
  };

  return {
    form,
    balance,
    isSubmitting,
    calculatedDays,
    isCalculating,
    validationError,
    startDate,
    endDate,
    leaveType,
    onSubmit,
  };
};