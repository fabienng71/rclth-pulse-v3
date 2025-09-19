
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MarginInsightsProps {
  marginData: any;
  selectedYear: number;
  selectedMonth: number;
  viewMode?: 'standard' | 'adjusted';
}

export const MarginInsights: React.FC<MarginInsightsProps> = ({ 
  marginData, 
  selectedYear,
  selectedMonth,
  viewMode = 'standard'
}) => {
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchInsights = async () => {
      if (!marginData) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.functions.invoke('margin-analysis-insights', {
          body: { 
            marginData,
            year: selectedYear,
            month: selectedMonth,
            viewMode
          }
        });
        
        if (error) throw new Error(error.message);
        
        if (data?.insights) {
          setInsights(data.insights);
        } else {
          setError('No insights could be generated');
        }
      } catch (err: any) {
        console.error('Error fetching margin insights:', err);
        setError(err.message || 'Failed to generate insights');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, [marginData, selectedYear, selectedMonth, viewMode]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  if (!insights) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No analysis data available for {months[selectedMonth-1]} {selectedYear}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>AI Margin Analysis Insights</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{insights}</ReactMarkdown>
      </CardContent>
    </Card>
  );
};
