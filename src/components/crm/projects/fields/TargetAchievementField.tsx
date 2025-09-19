
import React from 'react';
import { FormItem, FormLabel } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { useVendorAchievement } from '@/hooks/useVendorAchievement';
import { Card } from '@/components/ui/card';
import { ProjectFormValues } from '../schema';
import { formatNumber, formatCurrency } from '@/lib/utils';

export const TargetAchievementField = () => {
  const { watch } = useFormContext<ProjectFormValues>();
  
  const vendorCode = watch('vendor_code');
  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const targetValue = watch('target_value');
  const targetType = watch('target_type');
  
  const { totalValue, isLoading, error } = useVendorAchievement(
    vendorCode, 
    startDate, 
    endDate,
    targetType
  );
  
  // Calculate achievement percentage
  const percentage = targetValue > 0 ? Math.round((totalValue / targetValue) * 100) : 0;
  
  // Determine color based on percentage
  let statusColor = 'bg-gray-100';
  if (percentage >= 100) {
    statusColor = 'bg-green-100 text-green-800';
  } else if (percentage >= 50) {
    statusColor = 'bg-amber-100 text-amber-800';
  } else if (percentage > 0) {
    statusColor = 'bg-red-100 text-red-800';
  }

  const formattedValue = targetType === 'Amount' 
    ? formatCurrency(totalValue)
    : formatNumber(totalValue);

  const formattedTarget = targetType === 'Amount'
    ? formatCurrency(targetValue)
    : formatNumber(targetValue);
  
  return (
    <FormItem>
      <FormLabel>Target Achievement</FormLabel>
      <Card className="p-4">
        {isLoading ? (
          <div className="animate-pulse h-6 bg-gray-200 rounded"></div>
        ) : error ? (
          <div className="text-red-500">Error loading achievement data</div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Total {targetType === 'Amount' ? 'Sales' : 'Quantity'}:
              </span>
              <span className="font-medium">{formattedValue}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Target:</span>
              <span className="font-medium">
                {formattedTarget} {targetType === 'Amount' ? '' : targetType}
              </span>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Achievement:</span>
              <span className={`px-2 py-0.5 rounded text-sm font-medium ${statusColor}`}>
                {percentage}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className={`h-2.5 rounded-full ${percentage >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </Card>
    </FormItem>
  );
};
