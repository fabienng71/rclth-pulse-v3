
import React from 'react';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { SalespersonFilter } from '@/components/dashboard/SalespersonFilter';
import { useAuthStore } from '@/stores/authStore';

interface DashboardHeaderProps {
  fromDate: Date;
  toDate: Date;
  salespersonCode: string;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
  onSalespersonChange: (code: string) => void;
}

export const DashboardHeader = ({
  fromDate,
  toDate,
  salespersonCode,
  onFromDateChange,
  onToDateChange,
  onSalespersonChange
}: DashboardHeaderProps) => {
  const { isAdmin } = useAuthStore();
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-4">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>
      
      <div className="flex flex-col md:flex-row items-start md:items-end gap-3 flex-grow">
        <div className="flex-shrink-0">
          <DateRangeSelector 
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={onFromDateChange}
            onToDateChange={onToDateChange}
            showLabel={false}
          />
        </div>
        
        {isAdmin && (
          <div className="flex-shrink-0 w-48">
            <SalespersonFilter 
              value={salespersonCode} 
              onChange={onSalespersonChange} 
            />
          </div>
        )}
      </div>
    </div>
  );
};
