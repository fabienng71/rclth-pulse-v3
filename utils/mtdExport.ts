import { MTDDayData, MTDSummary } from '@/hooks/useMTDData';

export interface MTDExportData {
  data: MTDDayData[];
  summary: MTDSummary;
  metadata: {
    year: number;
    month: number;
    salesperson: string;
    generatedAt: Date;
    includeDeliveryFees: boolean;
    includeCreditMemos: boolean;
  };
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const exportToCSV = (exportData: MTDExportData): void => {
  const { data, summary, metadata } = exportData;
  
  // Prepare CSV content
  const csvContent = [
    // Header with metadata
    `MTD Sales Report - ${months[metadata.month - 1]} ${metadata.year}`,
    `Salesperson: ${metadata.salesperson === 'all' ? 'All Salespersons' : metadata.salesperson}`,
    `Generated: ${metadata.generatedAt.toLocaleString()}`,
    `Include Delivery Fees: ${metadata.includeDeliveryFees ? 'Yes' : 'No'}`,
    `Include Credit Memos: ${metadata.includeCreditMemos ? 'Yes' : 'No'}`,
    '',
    // Summary section
    'SUMMARY',
    `Current Year Total,${summary.current_year_total}`,
    `Previous Year Total,${summary.previous_year_total}`,
    `Variance %,${summary.total_variance_percent.toFixed(2)}`,
    `Current Year Daily Average,${summary.current_year_avg_daily}`,
    `Previous Year Daily Average,${summary.previous_year_avg_daily}`,
    `Working Days Passed,${summary.working_days_passed}`,
    `Total Working Days,${summary.total_working_days}`,
    `Target Amount,${summary.target_amount || 0}`,
    `Target Achievement %,${summary.target_achievement_percent?.toFixed(2) || 0}`,
    '',
    // Daily data section
    'DAILY DATA',
    'Day,Weekday,Current Year Sales,Previous Year Sales,Running Total Current,Running Total Previous,Variance %,Is Weekend,Is Holiday',
    ...data.map(day => [
      day.day_of_month,
      day.weekday_name,
      day.current_year_sales,
      day.previous_year_sales,
      day.running_total_current_year,
      day.running_total_previous_year,
      day.variance_percent.toFixed(2),
      day.is_weekend ? 'Yes' : 'No',
      day.is_holiday ? 'Yes' : 'No'
    ].join(','))
  ].join('\n');

  // Create and download file with UTF-8 BOM for proper character encoding
  const utf8BOM = '\uFEFF';
  const blob = new Blob([utf8BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `MTD_Report_${metadata.year}_${metadata.month.toString().padStart(2, '0')}_${metadata.salesperson}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (exportData: MTDExportData): void => {
  const { data, summary, metadata } = exportData;
  
  // Create Excel-compatible HTML table
  const excelContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .number { text-align: right; }
          .center { text-align: center; }
          .summary { background-color: #f9f9f9; }
          .metadata { background-color: #e8f4f8; }
        </style>
      </head>
      <body>
        <h1>MTD Sales Report - ${months[metadata.month - 1]} ${metadata.year}</h1>
        
        <table>
          <tr class="metadata">
            <th>Salesperson</th>
            <td>${metadata.salesperson === 'all' ? 'All Salespersons' : metadata.salesperson}</td>
          </tr>
          <tr class="metadata">
            <th>Generated</th>
            <td>${metadata.generatedAt.toLocaleString()}</td>
          </tr>
          <tr class="metadata">
            <th>Include Delivery Fees</th>
            <td>${metadata.includeDeliveryFees ? 'Yes' : 'No'}</td>
          </tr>
          <tr class="metadata">
            <th>Include Credit Memos</th>
            <td>${metadata.includeCreditMemos ? 'Yes' : 'No'}</td>
          </tr>
        </table>
        
        <br>
        
        <h2>Summary</h2>
        <table>
          <tr class="summary">
            <th>Current Year Total</th>
            <td class="number">${summary.current_year_total.toLocaleString()}</td>
          </tr>
          <tr class="summary">
            <th>Previous Year Total</th>
            <td class="number">${summary.previous_year_total.toLocaleString()}</td>
          </tr>
          <tr class="summary">
            <th>Variance %</th>
            <td class="number">${summary.total_variance_percent.toFixed(2)}%</td>
          </tr>
          <tr class="summary">
            <th>Current Year Daily Average</th>
            <td class="number">${summary.current_year_avg_daily.toLocaleString()}</td>
          </tr>
          <tr class="summary">
            <th>Previous Year Daily Average</th>
            <td class="number">${summary.previous_year_avg_daily.toLocaleString()}</td>
          </tr>
          <tr class="summary">
            <th>Working Days Passed</th>
            <td class="number">${summary.working_days_passed}</td>
          </tr>
          <tr class="summary">
            <th>Total Working Days</th>
            <td class="number">${summary.total_working_days}</td>
          </tr>
          <tr class="summary">
            <th>Target Amount</th>
            <td class="number">${(summary.target_amount || 0).toLocaleString()}</td>
          </tr>
          <tr class="summary">
            <th>Target Achievement %</th>
            <td class="number">${(summary.target_achievement_percent || 0).toFixed(2)}%</td>
          </tr>
        </table>
        
        <br>
        
        <h2>Daily Data</h2>
        <table>
          <tr>
            <th>Day</th>
            <th>Weekday</th>
            <th>Current Year Sales</th>
            <th>Previous Year Sales</th>
            <th>Running Total Current</th>
            <th>Running Total Previous</th>
            <th>Variance %</th>
            <th>Weekend</th>
            <th>Holiday</th>
          </tr>
          ${data.map(day => `
            <tr>
              <td class="center">${day.day_of_month}</td>
              <td>${day.weekday_name}</td>
              <td class="number">${day.current_year_sales.toLocaleString()}</td>
              <td class="number">${day.previous_year_sales.toLocaleString()}</td>
              <td class="number">${day.running_total_current_year.toLocaleString()}</td>
              <td class="number">${day.running_total_previous_year.toLocaleString()}</td>
              <td class="number">${day.variance_percent.toFixed(2)}%</td>
              <td class="center">${day.is_weekend ? 'Yes' : 'No'}</td>
              <td class="center">${day.is_holiday ? 'Yes' : 'No'}</td>
            </tr>
          `).join('')}
        </table>
      </body>
    </html>
  `;

  // Create and download file with UTF-8 BOM for proper character encoding
  const utf8BOM = '\uFEFF';
  const blob = new Blob([utf8BOM + excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `MTD_Report_${metadata.year}_${metadata.month.toString().padStart(2, '0')}_${metadata.salesperson}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatDataForExport = (
  data: MTDDayData[],
  summary: MTDSummary,
  year: number,
  month: number,
  salesperson: string,
  includeDeliveryFees: boolean,
  includeCreditMemos: boolean
): MTDExportData => {
  return {
    data,
    summary,
    metadata: {
      year,
      month,
      salesperson,
      generatedAt: new Date(),
      includeDeliveryFees,
      includeCreditMemos,
    },
  };
};