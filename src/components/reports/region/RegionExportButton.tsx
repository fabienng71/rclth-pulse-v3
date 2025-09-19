import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { RegionTurnoverResponse } from '@/hooks/useRegionTurnoverData';

interface RegionExportButtonProps {
  data: RegionTurnoverResponse | null;
  disabled?: boolean;
  className?: string;
}

export const RegionExportButton: React.FC<RegionExportButtonProps> = ({ 
  data, 
  disabled = false,
  className = ""
}) => {
  const handleExport = () => {
    if (!data || data.regions.length === 0) return;

    // Flatten the data for CSV export
    const exportData: any[] = [];
    
    data.regions.forEach(region => {
      region.customers.forEach(customer => {
        customer.monthly_data.forEach(monthData => {
          exportData.push({
            region: region.region,
            customer_code: customer.customer_code,
            customer_name: customer.customer_name,
            search_name: customer.search_name || '',
            salesperson_code: customer.salesperson_code || '',
            year_month: monthData.year_month,
            monthly_turnover: monthData.monthly_turnover,
            customer_total_turnover: customer.total_turnover,
            region_total_turnover: region.total_turnover
          });
        });
      });
    });

    // Generate CSV
    const headers = [
      'Region',
      'Customer Code',
      'Customer Name', 
      'Search Name',
      'Salesperson Code',
      'Year Month',
      'Monthly Turnover',
      'Customer Total Turnover',
      'Region Total Turnover'
    ];

    const csvContent = [
      headers.join(','),
      ...exportData.map(row => [
        `"${row.region}"`,
        `"${row.customer_code}"`,
        `"${row.customer_name}"`,
        `"${row.search_name}"`,
        `"${row.salesperson_code}"`,
        `"${row.year_month}"`,
        row.monthly_turnover,
        row.customer_total_turnover,
        row.region_total_turnover
      ].join(','))
    ].join('\n');

    // Download the CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `region_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || !data || data.regions.length === 0}
      className={className}
    >
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
};