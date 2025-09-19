import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { MTDDayData, MTDSummary, MTDDataOptions } from '@/hooks/useMTDData';
import { exportToCSV, exportToExcel, formatDataForExport } from '@/utils/mtdExport';
import { useToast } from '@/hooks/use-toast';

interface MTDExportControlsProps {
  data: MTDDayData[];
  summary: MTDSummary;
  selectedYear: number;
  selectedMonth: number;
  selectedSalesperson: string;
  options: MTDDataOptions;
  isLoading?: boolean;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MTDExportControls: React.FC<MTDExportControlsProps> = ({
  data,
  summary,
  selectedYear,
  selectedMonth,
  selectedSalesperson,
  options,
  isLoading = false,
}) => {
  const { toast } = useToast();

  const handleExportCSV = () => {
    try {
      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "No data available to export.",
          variant: "destructive",
        });
        return;
      }

      const exportData = formatDataForExport(
        data,
        summary,
        selectedYear,
        selectedMonth,
        selectedSalesperson,
        options.includeDeliveryFees,
        options.includeCreditMemos
      );

      exportToCSV(exportData);
      
      toast({
        title: "Export Successful",
        description: "MTD report exported to CSV successfully.",
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export CSV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    try {
      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "No data available to export.",
          variant: "destructive",
        });
        return;
      }

      const exportData = formatDataForExport(
        data,
        summary,
        selectedYear,
        selectedMonth,
        selectedSalesperson,
        options.includeDeliveryFees,
        options.includeCreditMemos
      );

      exportToExcel(exportData);
      
      toast({
        title: "Export Successful",
        description: "MTD report exported to Excel successfully.",
      });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export Excel. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Export Options:</p>
            <div className="space-y-1">
              <p>• Period: {months[selectedMonth - 1]} {selectedYear}</p>
              <p>• Salesperson: {selectedSalesperson === 'all' ? 'All Salespersons' : selectedSalesperson}</p>
              <p>• Delivery Fees: {options.includeDeliveryFees ? 'Included' : 'Excluded'}</p>
              <p>• Credit Memos: {options.includeCreditMemos ? 'Included' : 'Excluded'}</p>
              <p>• Data Points: {data?.length || 0} days</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleExportCSV}
              disabled={isLoading || !data || data.length === 0}
              className="flex items-center gap-2"
              variant="outline"
            >
              <FileText className="h-4 w-4" />
              Export CSV
            </Button>

            <Button
              onClick={handleExportExcel}
              disabled={isLoading || !data || data.length === 0}
              className="flex items-center gap-2"
              variant="outline"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              Exported files will include all daily data, summary metrics, and current filter settings.
              Files are saved to your Downloads folder.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};