import { ProcessedTopNData } from '@/hooks/useTopNCustomersData';
import { formatCurrency } from '@/utils/formatters';
import { exportToExcel } from '@/utils/excel/core';

/**
 * Export Top N customer data to CSV format
 */
export const exportTopNToCSV = (data: ProcessedTopNData, fileName: string = 'top-n-customers') => {
  if (!data.customers.length) {
    throw new Error('No data to export');
  }

  // Prepare CSV data
  const csvData = [];
  
  // Header row
  const headers = ['Rank', 'Customer Code', 'Customer Name', ...data.months, 'Total Turnover', 'Total Margin', 'Margin %'];
  csvData.push(headers);
  
  // Customer rows
  data.customers.forEach((customer, index) => {
    const row = [
      index + 1, // Rank
      customer.customer_code,
      customer.search_name || customer.customer_name,
      ...data.months.map(month => customer.monthly_data[month] || 0),
      customer.total_turnover,
      customer.total_margin,
      customer.total_margin_percent.toFixed(1) + '%'
    ];
    csvData.push(row);
  });
  
  // Monthly totals row
  const totalsRow = [
    '', // Rank
    '', // Customer Code
    'Monthly Totals',
    ...data.months.map(month => data.monthlyTotals[month] || 0),
    data.grandTotal,
    data.grandMarginTotal,
    data.grandTotal > 0 ? ((data.grandMarginTotal / data.grandTotal) * 100).toFixed(1) + '%' : '0.0%'
  ];
  csvData.push(totalsRow);
  
  // Convert to CSV string
  const csvContent = csvData.map(row => 
    row.map(cell => {
      // Handle numbers and strings properly
      if (typeof cell === 'number') {
        return cell.toString();
      }
      // Escape commas and quotes in text
      const cellStr = cell.toString();
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
  
  // Download CSV file with UTF-8 BOM for proper character encoding
  const utf8BOM = '\uFEFF';
  const blob = new Blob([utf8BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export Top N customer data to Excel format
 */
export const exportTopNToExcel = (data: ProcessedTopNData, fileName: string = 'top-n-customers') => {
  if (!data.customers.length) {
    throw new Error('No data to export');
  }

  // Prepare data for summary sheet
  const summaryData = [
    { Metric: 'Total Customers', Value: data.customers.length },
    { Metric: 'Total Turnover', Value: formatCurrency(data.grandTotal) },
    { Metric: 'Total Margin', Value: formatCurrency(data.grandMarginTotal) },
    { Metric: 'Overall Margin %', Value: data.grandTotal > 0 ? ((data.grandMarginTotal / data.grandTotal) * 100).toFixed(1) + '%' : '0.0%' },
    { Metric: 'Average Monthly Turnover', Value: formatCurrency(data.grandTotal / (data.months.length || 1)) },
    { Metric: 'Top Customer Turnover', Value: data.customers.length > 0 ? formatCurrency(data.customers[0].total_turnover) : '0' },
    { Metric: 'Report Period', Value: `${data.months.length} months` }
  ];

  // Prepare customer details data
  const customerData = data.customers.map((customer, index) => {
    const customerRow: Record<string, any> = {
      Rank: index + 1,
      'Customer Code': customer.customer_code,
      'Customer Name': customer.search_name || customer.customer_name,
      'Total Turnover': customer.total_turnover,
      'Total Margin': customer.total_margin,
      'Margin %': customer.total_margin_percent.toFixed(1) + '%'
    };
    
    // Add monthly data
    data.months.forEach(month => {
      const formattedMonth = formatMonthHeader(month);
      customerRow[formattedMonth] = customer.monthly_data[month] || 0;
    });
    
    return customerRow;
  });

  // Add monthly totals row
  const totalsRow: Record<string, any> = {
    Rank: '',
    'Customer Code': '',
    'Customer Name': 'MONTHLY TOTALS',
    'Total Turnover': data.grandTotal,
    'Total Margin': data.grandMarginTotal,
    'Margin %': data.grandTotal > 0 ? ((data.grandMarginTotal / data.grandTotal) * 100).toFixed(1) + '%' : '0.0%'
  };
  
  data.months.forEach(month => {
    const formattedMonth = formatMonthHeader(month);
    totalsRow[formattedMonth] = data.monthlyTotals[month] || 0;
  });
  
  customerData.push(totalsRow);

  // Prepare monthly breakdown data
  const monthlyData = data.months.map(month => ({
    Month: formatMonthHeader(month),
    'Total Turnover': data.monthlyTotals[month] || 0,
    'Formatted Total': formatCurrency(data.monthlyTotals[month] || 0),
    'Number of Customers': data.customers.filter(c => (c.monthly_data[month] || 0) > 0).length
  }));

  // Export to Excel with multiple sheets
  const workbookData = [
    { sheetName: 'Summary', data: summaryData },
    { sheetName: 'Customer Details', data: customerData },
    { sheetName: 'Monthly Breakdown', data: monthlyData }
  ];

  exportToExcel(workbookData, fileName);
};

/**
 * Format month string for display (YYYY-MM to MMM YYYY)
 */
const formatMonthHeader = (month: string): string => {
  try {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  } catch {
    return month;
  }
};

/**
 * Get export filename with timestamp
 */
export const getExportFileName = (baseName: string = 'top-n-customers'): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  return `${baseName}-${timestamp}`;
};