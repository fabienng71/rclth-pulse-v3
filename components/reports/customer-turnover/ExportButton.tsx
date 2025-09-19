
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { CustomerMonthlyTurnover } from '@/hooks/useCustomerTurnoverData';
import { format, parse } from 'date-fns';

interface ExportButtonProps {
  data: CustomerMonthlyTurnover[];
  uniqueCustomers: Array<{ code: string; name: string }>;
  uniqueMonths: string[];
  dataMap: Record<string, Record<string, number>>;
  customerTotals: Record<string, number>;
  monthTotals: Record<string, number>;
  grandTotal: number;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  uniqueCustomers,
  uniqueMonths,
  dataMap,
  customerTotals,
  monthTotals,
  grandTotal
}) => {
  // Format month for display (e.g., "2023-05" to "May")
  const formatMonthDisplay = (yearMonth: string) => {
    try {
      const date = parse(yearMonth, 'yyyy-MM', new Date());
      return format(date, 'MMM');
    } catch (e) {
      return yearMonth;
    }
  };

  // Format cell value for the Excel file
  const formatCellValue = (value: number) => {
    // Excel handles number formatting, no need to format it here
    return value;
  };

  const handleExport = () => {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Create headers
    const headers = ["Customer", ...uniqueMonths.map(formatMonthDisplay), "Total"];
    
    // Create rows
    const rows = uniqueCustomers.map(customer => {
      return [
        customer.name,
        ...uniqueMonths.map(month => formatCellValue(dataMap[customer.code][month])),
        formatCellValue(customerTotals[customer.code])
      ];
    });
    
    // Add totals row
    const totalsRow = [
      "Totals",
      ...uniqueMonths.map(month => formatCellValue(monthTotals[month])),
      formatCellValue(grandTotal)
    ];
    
    rows.push(totalsRow);
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    
    // Add currency formatting
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = 1; C <= range.e.c; C++) { // Skip first column (customer name)
      for (let R = 1; R <= range.e.r; R++) { // Skip header row
        const cell_address = XLSX.utils.encode_cell({c: C, r: R});
        if (!worksheet[cell_address]) continue;
        worksheet[cell_address].z = '"฿"#,##0;[Red]"(฿"#,##0")';
      }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Turnover");
    
    // Generate file name with current date
    const fileName = `Customer_Turnover_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    // Export workbook
    XLSX.writeFile(workbook, fileName);
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      className="ml-auto"
    >
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Export to Excel
    </Button>
  );
};
