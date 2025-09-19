
import React from 'react';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { SalespersonFilter } from '@/components/dashboard/SalespersonFilter';
import { useAuthStore } from '@/stores/authStore';

interface DashboardFiltersProps {
  fromDate: Date;
  toDate: Date;
  salespersonCode: string;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
  onSalespersonChange: (code: string) => void;
}

export const DashboardFilters = ({
  fromDate,
  toDate,
  salespersonCode,
  onFromDateChange,
  onToDateChange,
  onSalespersonChange
}: DashboardFiltersProps) => {
  const { isAdmin } = useAuthStore();
  
  return (
    <div className="flex flex-col md:flex-row items-end gap-4">
      {isAdmin && (
        <div className="w-full md:w-auto">
          <SalespersonFilter 
            value={salespersonCode} 
            onChange={onSalespersonChange} 
          />
        </div>
      )}
      
      <div className="w-full md:w-auto flex-grow">
        <DateRangeSelector 
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={onFromDateChange}
          onToDateChange={onToDateChange}
        />
      </div>
    </div>
  );
};
