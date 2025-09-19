
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesAnalysisProps {
  customerCode: string;
  fromDate: Date;
  toDate: Date;
  customerName?: string;
  searchName?: string;
}

export const SalesAnalysis = ({ 
  customerCode, 
  fromDate, 
  toDate, 
  customerName = '', 
  searchName 
}: SalesAnalysisProps) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previousAnalysis, setPreviousAnalysis] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Fetch previous analysis and analytics data when component mounts
  useEffect(() => {
    fetchPreviousAnalysis();
    fetchAnalyticsData();
  }, [customerCode]);

  const fetchPreviousAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_analysis')
        .select('ai_analysis, created_at')
        .eq('customer_code', customerCode)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setPreviousAnalysis(data[0].ai_analysis);
      }
    } catch (error) {
      console.error('Error fetching previous analysis:', error);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setIsLoadingAnalytics(true);
      
      const { data, error } = await supabase
        .from('customer_analytics')
        .select('*')
        .eq('customer_code', customerCode)
        .single();
        
      if (error && error.code !== 'PGRST116') { // Not found error code
        throw error;
      }
      
      if (data) {
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const saveAnalysis = async () => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('ai_analysis')
        .insert({
          customer_code: customerCode,
          customer_name: customerName,
          search_name: searchName,
          ai_analysis: analysis,
          date_range: `${format(fromDate, 'yyyy-MM-dd')} to ${format(toDate, 'yyyy-MM-dd')}`
        });

      if (error) throw error;
      
      toast.success('Analysis saved successfully');
      fetchPreviousAnalysis(); // Refresh the previous analysis
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast.error('Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const generateAnalysis = async () => {
    try {
      setIsLoading(true);
      setAnalysis(''); // Reset any previous analysis
      
      // Fetch sales data for the customer within the date range
      const { data: salesData, error } = await supabase
        .from('salesdata')
        .select(`
          item_code,
          description,
          base_unit_code,
          posting_date,
          quantity,
          amount,
          unit_price,
          unit_cost
        `)
        .eq('customer_code', customerCode)
        .gte('posting_date', format(fromDate, 'yyyy-MM-dd'))
        .lte('posting_date', format(toDate, 'yyyy-MM-dd'))
        .order('posting_date', { ascending: true });

      if (error) throw error;

      if (!salesData || salesData.length === 0) {
        setAnalysis('No sales data available for the selected customer and date range.');
        setIsLoading(false);
        return;
      }

      console.log(`Found ${salesData.length} sales records for analysis`);
      
      if (salesData.length > 500) {
        toast.info(`Analyzing a sample of the ${salesData.length} sales records to stay within API limits.`);
      }

      // Call the edge function with the sales data
      const response = await supabase.functions.invoke('analyze-sales', {
        body: {
          salesData,
          customerCode,
          dateRange: {
            from: format(fromDate, 'yyyy-MM-dd'),
            to: format(toDate, 'yyyy-MM-dd')
          }
        }
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(`Failed to generate analysis: ${response.error}`);
      }

      if (!response.data.analysis) {
        throw new Error('No analysis received from the server');
      }

      setAnalysis(response.data.analysis);
      toast.success('Analysis generated successfully');
    } catch (error) {
      console.error('Error generating analysis:', error);
      
      if (error instanceof Error && error.message.includes('429')) {
        setAnalysis('Analysis failed due to API rate limits. Please try again in a few minutes or reduce the date range.');
        toast.error('API rate limit exceeded. Try a shorter date range.');
      } else {
        setAnalysis('Failed to generate analysis. Please try again with a smaller data set or shorter time period.');
        toast.error('Failed to generate analysis');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAnalysisAsTxt = () => {
    if (!analysis) return;
    
    const element = document.createElement('a');
    const file = new Blob([analysis], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${customerCode}-analysis-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-muted-foreground">Generating analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analytics Summary Card */}
      {analyticsData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer Analytics Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>First Purchase:</strong> {analyticsData.first_purchase_date ? format(new Date(analyticsData.first_purchase_date), 'PP') : 'N/A'}</p>
            <p><strong>Last Purchase:</strong> {analyticsData.last_purchase_date ? format(new Date(analyticsData.last_purchase_date), 'PP') : 'N/A'}</p>
            <p><strong>Total Purchases:</strong> {analyticsData.total_purchases || 0}</p>
            <p><strong>Total Amount:</strong> ${analyticsData.total_amount ? analyticsData.total_amount.toLocaleString() : '0'}</p>
            <p><strong>Avg. Order Value:</strong> ${analyticsData.average_order_value ? analyticsData.average_order_value.toLocaleString() : '0'}</p>
            {analyticsData.top_categories && analyticsData.top_categories.length > 0 && (
              <p><strong>Top Categories:</strong> {analyticsData.top_categories.join(', ')}</p>
            )}
            {analyticsData.favorite_items && analyticsData.favorite_items.length > 0 && (
              <p><strong>Favorite Items:</strong> {analyticsData.favorite_items.join(', ')}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={generateAnalysis}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Generate New Analysis
        </Button>

        {analysis && (
          <>
            <Button
              onClick={saveAnalysis}
              disabled={isSaving}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Analysis'}
            </Button>

            <Button
              onClick={downloadAnalysisAsTxt}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </>
        )}
      </div>

      {/* Analysis Content */}
      <div className="prose max-w-none">
        {analysis ? (
          <div className="whitespace-pre-wrap bg-white p-6 rounded-md border">{analysis}</div>
        ) : previousAnalysis ? (
          <div>
            <p className="text-muted-foreground mb-4">Previous analysis available. Generate a new analysis or view the previous one below:</p>
            <div className="whitespace-pre-wrap bg-gray-50 p-6 rounded-md border">{previousAnalysis}</div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground p-8 bg-gray-50 rounded-md border">
            No analysis available. Click "Generate New Analysis" to create one.
          </div>
        )}
      </div>
    </div>
  );
};
