
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ExternalLink, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';

interface OverdueSample {
  id: string;
  customer_name: string;
  search_name: string;
  follow_up_date: string;
  created_at: string;
}

interface OverdueSamplesPanelProps {
  isLoading: boolean;
}

export const OverdueSamplesPanel = ({ isLoading: parentLoading }: OverdueSamplesPanelProps) => {
  const [overdueSamples, setOverdueSamples] = useState<OverdueSample[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOverdueSamples = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        let query = supabase
          .from('sample_requests')
          .select('id, customer_name, search_name, follow_up_date, created_at')
          .not('follow_up_date', 'is', null)
          .lte('follow_up_date', today);

        // Filter by salesperson if not admin
        if (!isAdmin && user.profile?.spp_code) {
          query = query.eq('salesperson_code', user.profile.spp_code);
        }

        const { data, error } = await query.order('follow_up_date', { ascending: true });

        if (error) throw error;
        setOverdueSamples(data || []);
      } catch (error) {
        console.error('Error fetching overdue samples:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverdueSamples();
  }, [user, isAdmin]);

  const handleViewAllClick = () => {
    navigate('/forms/sample');
  };

  const handleCardClick = () => {
    navigate('/forms/sample');
  };

  if (parentLoading || loading) {
    return (
      <Card className="section-background backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Skeleton className="h-4 w-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const overdueCount = overdueSamples.length;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow section-background backdrop-blur-sm border-border/50"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Overdue Samples</span>
            {overdueCount > 0 && (
              <span className="bg-red-100 text-red-700 border-red-200 text-xs px-2 py-1 rounded-full border">
                {overdueCount}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Sample requests requiring follow-up
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewAllClick();
          }}
        >
          View All
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {overdueCount === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No overdue samples</p>
            <p className="text-sm">All sample requests are up to date!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">
                  {overdueCount} overdue sample{overdueCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {overdueSamples.slice(0, 3).map((sample) => (
              <div 
                key={sample.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {sample.search_name || sample.customer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due: {format(new Date(sample.follow_up_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            ))}
            
            {overdueCount > 3 && (
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  +{overdueCount - 3} more overdue samples
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
