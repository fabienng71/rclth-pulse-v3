import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { ProcessedTopNData } from '@/hooks/useTopNCustomersData';
import { exportTopNToCSV, exportTopNToExcel, getExportFileName } from '@/utils/topNExport';
import { useToast } from '@/components/ui/use-toast';

interface TopNExportButtonProps {
  data: ProcessedTopNData | null;
  disabled?: boolean;
  className?: string;
}

export const TopNExportButton: React.FC<TopNExportButtonProps> = ({
  data,
  disabled = false,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'csv' | 'excel') => {
    if (!data || !data.customers.length) {
      toast({
        title: 'No Data',
        description: 'No data available to export. Please run the report first.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const fileName = getExportFileName();
      
      if (format === 'csv') {
        exportTopNToCSV(data, fileName);
        toast({
          title: 'Export Successful',
          description: `CSV file "${fileName}.csv" has been downloaded.`,
        });
      } else {
        exportTopNToExcel(data, fileName);
        toast({
          title: 'Export Successful',
          description: `Excel file "${fileName}.xlsx" has been downloaded.`,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export data.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const hasData = data && data.customers.length > 0;
  const buttonDisabled = disabled || isExporting || !hasData;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={buttonDisabled}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={buttonDisabled}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('excel')}
          disabled={buttonDisabled}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};