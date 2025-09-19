
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useShortBusinessReport } from '@/hooks/useShortBusinessReport';
import { ShortBusinessReportTable } from './ShortBusinessReportTable';
import { YTDSummaryCards } from './YTDSummaryCards';
import { exportToExcel } from '@/utils/excel';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const getCurrentFiscalYear = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
  
  if (currentMonth >= 4) {
    return now.getFullYear();
  } else {
    return now.getFullYear() - 1;
  }
};

const generateFiscalYearOptions = () => {
  const currentFiscalYear = getCurrentFiscalYear();
  const options = [];
  
  for (let i = 0; i < 5; i++) {
    const year = currentFiscalYear - i;
    options.push({
      value: year,
      label: `FY ${year}-${year + 1}`,
    });
  }
  
  return options;
};

export const ShortBusinessReport: React.FC = () => {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(getCurrentFiscalYear());
  const { data, isLoading, error } = useShortBusinessReport(selectedFiscalYear);
  
  const fiscalYearOptions = generateFiscalYearOptions();

  const handleExportExcel = () => {
    if (!data) return;

    const workbookData = [
      {
        sheetName: 'Monthly Data',
        data: data.monthly_data.map(month => ({
          'Month': new Date(2024, month.month_num - 1).toLocaleString('default', { month: 'long' }),
          'Net Turnover': month.net_turnover,
          'Net Gross Margin': month.net_gross_margin,
          'Budget': month.budget,
          'Prev Year': month.prev_year_turnover,
          'Budget vs Actual %': month.budget_vs_actual_percent,
          'YoY %': month.yoy_percent,
          'Net Daily Avg': month.net_daily_avg,
          'Customers': month.customers_served,
          'Invoices': month.invoices_issued,
          'Net Avg Invoice': month.net_avg_invoice_amount,
          'Working Days': month.working_days,
          'Credit Memo Amount': month.credit_memo_amount,
        })),
      },
      {
        sheetName: 'YTD Summary',
        data: [
          {
            'Metric': 'Total Net Turnover',
            'Value': data.ytd_summary.total_net_turnover,
          },
          {
            'Metric': 'Total Net Gross Margin',
            'Value': data.ytd_summary.total_net_gross_margin,
          },
          {
            'Metric': 'Total Budget',
            'Value': data.ytd_summary.total_budget,
          },
          {
            'Metric': 'Total Credit Memos',
            'Value': data.ytd_summary.total_credit_memos,
          },
          {
            'Metric': 'YTD Budget vs Actual %',
            'Value': data.ytd_summary.ytd_budget_vs_actual_percent,
          },
          {
            'Metric': 'YTD YoY %',
            'Value': data.ytd_summary.ytd_yoy_percent,
          },
        ],
      },
    ];

    exportToExcel(workbookData, `Short_Business_Report_FY${selectedFiscalYear}`);
  };

  const handleExportPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Title
    doc.setFontSize(16);
    doc.text(`Short Business Report - FY ${selectedFiscalYear}-${selectedFiscalYear + 1}`, pageWidth / 2, 20, { align: 'center' });
    
    // YTD Summary
    doc.setFontSize(12);
    doc.text('Year-to-Date Summary', 14, 40);
    
    const ytdData = [
      ['Total Net Turnover', data.ytd_summary.total_net_turnover.toLocaleString()],
      ['Total Net Gross Margin', data.ytd_summary.total_net_gross_margin.toLocaleString()],
      ['Total Budget', data.ytd_summary.total_budget.toLocaleString()],
      ['Total Credit Memos', data.ytd_summary.total_credit_memos.toLocaleString()],
      ['YTD Budget vs Actual %', data.ytd_summary.ytd_budget_vs_actual_percent ? `${data.ytd_summary.ytd_budget_vs_actual_percent}%` : 'N/A'],
      ['YTD YoY %', data.ytd_summary.ytd_yoy_percent ? `${data.ytd_summary.ytd_yoy_percent}%` : 'N/A'],
    ];

    (doc as any).autoTable({
      startY: 45,
      head: [['Metric', 'Value']],
      body: ytdData,
      margin: { left: 14 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 80, halign: 'right' },
      },
    });

    // Monthly Data
    doc.text('Monthly Breakdown', 14, (doc as any).lastAutoTable.finalY + 20);
    
    const monthlyHeaders = ['Month', 'Net Turnover', 'Budget', 'Budget vs Actual %', 'YoY %'];
    const monthlyData = data.monthly_data.map(month => [
      new Date(2024, month.month_num - 1).toLocaleString('default', { month: 'short' }),
      month.net_turnover.toLocaleString(),
      month.budget.toLocaleString(),
      month.budget_vs_actual_percent ? `${month.budget_vs_actual_percent}%` : 'N/A',
      month.yoy_percent ? `${month.yoy_percent}%` : 'N/A',
    ]);

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 25,
      head: [monthlyHeaders],
      body: monthlyData,
      margin: { left: 14 },
      styles: { fontSize: 8 },
    });

    doc.save(`Short_Business_Report_FY${selectedFiscalYear}.pdf`);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading business report: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Short Business Report</CardTitle>
            <div className="flex items-center gap-4">
              <Select
                value={selectedFiscalYear.toString()}
                onValueChange={(value) => setSelectedFiscalYear(parseInt(value))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Fiscal Year" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYearOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  disabled={!data || isLoading}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={!data || isLoading}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* YTD Summary Cards */}
      <YTDSummaryCards data={data?.ytd_summary} isLoading={isLoading} />

      {/* Monthly Data Table */}
      <ShortBusinessReportTable 
        data={data?.monthly_data || []} 
        isLoading={isLoading}
        fiscalYear={selectedFiscalYear}
      />
    </div>
  );
};
