
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DownloadIcon, Search } from 'lucide-react';
import { exportToExcel } from '@/lib/utils';
import { ProcessedMarginData } from './types';

interface ExportOptionsProps {
  data: ProcessedMarginData | Record<string, any>;
  selectedYear: number;
  selectedMonth: number;
  activeTab?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({ 
  data, 
  selectedYear, 
  selectedMonth,
  activeTab = 'items',
  searchTerm = '',
  onSearchChange
}) => {
  const handleExportToExcel = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const fileName = `margin-analysis-${selectedYear}-${months[selectedMonth - 1]}`;
    
    const workbookData = {
      'Top Items': data.topItems || [],
      'Top Customers': data.topCustomers || [],
      'Categories': data.categories || []
    };
    
    exportToExcel(workbookData, fileName);
  };

  // Only render the search input if onSearchChange is provided
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Search ${activeTab === 'items' ? 'items' : 'customers'}...`}
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8 h-9 w-[200px]"
          />
        </div>
      )}
      
      <Button 
        onClick={handleExportToExcel} 
        variant="outline" 
        size="sm"
        className="flex items-center gap-2"
      >
        <DownloadIcon className="h-4 w-4" />
        <span>Export to Excel</span>
      </Button>
    </div>
  );
};
