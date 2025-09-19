
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerAnalytics } from './types';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CustomerAnalyticsSummaryProps {
  customerCode: string;
}

export const CustomerAnalyticsSummary = ({ customerCode }: CustomerAnalyticsSummaryProps) => {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (customerCode) {
      fetchAnalytics();
    }
  }, [customerCode]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('customer_analytics')
        .select('*')
        .eq('customer_code', customerCode)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        const analyticsData: CustomerAnalytics = {
          ...data,
          rfm_score: data.rfm_score ? data.rfm_score as {
            recency: number;
            frequency: number;
            monetary: number;
            segment: string;
          } : null,
          yoy_growth: data.yoy_growth ? data.yoy_growth as {
            yearly_growth: Array<{
              year: number;
              amount: number;
              growth_percentage: number;
            }>;
            average_growth: number;
          } : null,
          customer_segments: data.customer_segments ? data.customer_segments as {
            value_segment: string;
            engagement_segment: string;
            growth_segment: string;
            metrics: {
              avg_order_value: number;
              purchase_frequency: number;
              total_revenue: number;
              growth_trend: number;
            };
          } : null
        };
        setAnalytics(analyticsData);
      } else {
        setAnalytics(null);
      }
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      setIsRefreshing(true);
      
      const { error } = await supabase.rpc('update_customer_analytics', {
        p_customer_code: customerCode
      });
      
      if (error) throw error;
      
      await fetchAnalytics();
      toast.success('Analytics refreshed successfully');
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      toast.error('Failed to refresh analytics');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatGrowth = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Customer Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Customer Analytics</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshAnalytics}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No analytics data available for this customer.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4" 
            onClick={refreshAnalytics}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Generate Analytics
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Customer Analytics</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshAnalytics}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        {analytics.last_analysis_date && (
          <p className="text-xs text-muted-foreground">
            Last updated: {format(new Date(analytics.last_analysis_date), 'PPp')}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>First Purchase:</strong> {analytics.first_purchase_date ? format(new Date(analytics.first_purchase_date), 'PP') : 'N/A'}</p>
                <p><strong>Last Purchase:</strong> {analytics.last_purchase_date ? format(new Date(analytics.last_purchase_date), 'PP') : 'N/A'}</p>
                <p><strong>Total Purchases:</strong> {analytics.total_purchases || 0}</p>
                <p><strong>Purchase Frequency:</strong> {analytics.purchase_frequency?.toFixed(2) || '0'} orders/day</p>
              </div>
              <div>
                <p><strong>Total Amount:</strong> ${analytics.total_amount?.toLocaleString() || '0'}</p>
                <p><strong>Avg. Order Value:</strong> ${analytics.average_order_value?.toLocaleString() || '0'}</p>
                {analytics.buying_pattern && (
                  <p><strong>Buying Pattern:</strong> {analytics.buying_pattern}</p>
                )}
                {analytics.rfm_score && (
                  <p><strong>RFM Segment:</strong> {analytics.rfm_score.segment}</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="growth">
            {analytics.yoy_growth ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Average Growth Rate: {formatGrowth(analytics.yoy_growth.average_growth)}
                  </p>
                </div>
                <div className="space-y-2">
                  {analytics.yoy_growth.yearly_growth.map((year) => (
                    <div key={year.year} className="flex justify-between items-center">
                      <span>{year.year}:</span>
                      <span className={year.growth_percentage > 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatGrowth(year.growth_percentage)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No growth data available</p>
            )}
          </TabsContent>

          <TabsContent value="segments">
            {analytics.customer_segments ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-lg font-semibold">{analytics.customer_segments.value_segment}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Engagement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-lg font-semibold">{analytics.customer_segments.engagement_segment}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Growth
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-lg font-semibold">{analytics.customer_segments.growth_segment}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p><strong>Metrics Details:</strong></p>
                  <ul className="list-inside space-y-1">
                    <li>Average Order Value: ${analytics.customer_segments.metrics.avg_order_value.toLocaleString()}</li>
                    <li>Purchase Frequency: {analytics.customer_segments.metrics.purchase_frequency.toFixed(3)} orders/day</li>
                    <li>Total Revenue: ${analytics.customer_segments.metrics.total_revenue.toLocaleString()}</li>
                    <li>Growth Trend: {formatGrowth(analytics.customer_segments.metrics.growth_trend)}</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No segmentation data available</p>
            )}
          </TabsContent>
        </Tabs>

        {analytics.top_categories && analytics.top_categories.length > 0 && (
          <div>
            <p className="font-semibold mt-2">Top Categories:</p>
            <ul className="list-disc list-inside pl-2">
              {analytics.top_categories.map((category, index) => (
                <li key={index}>{category}</li>
              ))}
            </ul>
          </div>
        )}
        
        {analytics.favorite_items && analytics.favorite_items.length > 0 && (
          <div>
            <p className="font-semibold mt-2">Favorite Items:</p>
            <ul className="list-disc list-inside pl-2">
              {analytics.favorite_items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
