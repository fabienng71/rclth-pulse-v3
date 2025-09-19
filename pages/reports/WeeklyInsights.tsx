
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, BarChart3, Sparkles, Activity } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { getISOWeek } from 'date-fns';

interface WeekOption {
  value: number;
  label: string;
}

const WeeklyInsights = () => {
  const { user, isAdmin } = useAuthStore();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [weekOptions, setWeekOptions] = useState<WeekOption[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWeeks, setIsLoadingWeeks] = useState(true);

  // Generate week options
  useEffect(() => {
    const fetchWeeks = async () => {
      setIsLoadingWeeks(true);
      try {
        const { data, error } = await supabase
          .from('weeks')
          .select('week_number, start_date, end_date')
          .eq('year', selectedYear)
          .order('week_number', { ascending: false });

        if (error) throw error;

        const options = data.map(week => ({
          value: week.week_number,
          label: `Week ${week.week_number} (${new Date(week.start_date).toLocaleDateString()} - ${new Date(week.end_date).toLocaleDateString()})`
        }));

        setWeekOptions(options);

        // Set current week as default if not already set
        if (!selectedWeek && options.length > 0) {
          const currentWeek = getISOWeek(new Date());
          const currentWeekOption = options.find(opt => opt.value === currentWeek);
          if (currentWeekOption) {
            setSelectedWeek(currentWeek);
          } else {
            setSelectedWeek(options[0].value);
          }
        }
      } catch (error) {
        console.error('Error fetching weeks:', error);
        toast.error('Failed to load weeks');
      } finally {
        setIsLoadingWeeks(false);
      }
    };

    fetchWeeks();
  }, [selectedYear]);

  const handleAnalyze = async (analysisMode: 'enhanced' | 'original' = 'enhanced') => {
    if (!selectedWeek) {
      toast.error('Please select a week');
      return;
    }

    setIsLoading(true);
    setAnalysis('');
    setAnalysisType('');
    
    try {
      console.log('Starting analysis for:', { year: selectedYear, week: selectedWeek, mode: analysisMode });

      // Use enhanced analysis by default, fallback to original if needed
      const functionName = analysisMode === 'enhanced' 
        ? 'enhanced-weekly-insights-analysis' 
        : 'weekly-insights-analysis';

      const requestBody = analysisMode === 'enhanced' 
        ? {
            year: selectedYear,
            week: selectedWeek,
            salespersonCode: isAdmin ? null : user?.profile?.spp_code,
            isAdmin: isAdmin,
            analysisType: 'comprehensive'
          }
        : {
            year: selectedYear,
            week: selectedWeek,
            salespersonCode: isAdmin ? null : user?.profile?.spp_code,
            isAdmin: isAdmin
          };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody
      });

      if (error) {
        console.error('Function error:', error);
        
        // If enhanced analysis fails, try original analysis
        if (analysisMode === 'enhanced') {
          console.log('Enhanced analysis failed, falling back to original...');
          return handleAnalyze('original');
        }
        
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);
      setAnalysisType(data.analysisType || 'standard');
      
      let successMessage = 'Weekly insights generated successfully';
      
      if (data.analysisType === 'enhanced_v2') {
        successMessage = '🚀 Enhanced analytics with intelligent data sampling completed';
      } else if (data.analysisType === 'enhanced_fine_dining') {
        successMessage = '🍽️ Enhanced restaurant intelligence analysis generated';
      }
      
      toast.success(successMessage);
      
      // Log enhanced metrics if available
      if (data.enhancedMetrics) {
        console.log('Enhanced Analysis Metrics:', data.enhancedMetrics);
      }
      
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error(`Failed to generate insights: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const yearOptions = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  const getAnalysisTypeInfo = () => {
    if (analysisType === 'enhanced_v2') {
      return {
        label: 'Enhanced Analytics v2',
        icon: Sparkles,
        description: 'Intelligent data sampling with trend analysis',
        color: 'bg-green-100 text-green-800 border-green-200'
      };
    } else if (analysisType === 'enhanced_fine_dining') {
      return {
        label: 'Enhanced Restaurant Intelligence',
        icon: Sparkles,
        description: 'Advanced fine dining restaurant supply analysis',
        color: 'bg-purple-100 text-purple-800 border-purple-200'
      };
    }
    return {
      label: 'Standard Analysis',
      icon: Activity,
      description: 'Comprehensive sales analysis',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    };
  };

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      <main className="container py-6">
        <div className="flex items-center mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold md:text-3xl">Weekly Insights</h1>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                AI-Powered Sales Analysis
              </CardTitle>
              <CardDescription>
                Select a week to generate comprehensive sales insights using AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Week</label>
                  <Select 
                    value={selectedWeek?.toString() || ''} 
                    onValueChange={(value) => setSelectedWeek(parseInt(value))}
                    disabled={isLoadingWeeks}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingWeeks ? "Loading weeks..." : "Select week"} />
                    </SelectTrigger>
                    <SelectContent>
                      {weekOptions.map(week => (
                        <SelectItem key={week.value} value={week.value.toString()}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium invisible">Action</label>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAnalyze('enhanced')} 
                      disabled={isLoading || !selectedWeek || isLoadingWeeks}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Enhanced Analysis
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleAnalyze('original')} 
                      disabled={isLoading || !selectedWeek || isLoadingWeeks}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Activity className="mr-2 h-4 w-4" />
                          Standard Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {analysis && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Weekly Sales Analysis</CardTitle>
                    <CardDescription>
                      AI-generated insights for Week {selectedWeek}, {selectedYear}
                    </CardDescription>
                  </div>
                  {analysisType && (
                    <Badge className={getAnalysisTypeInfo().color}>
                      {React.createElement(getAnalysisTypeInfo().icon, { className: "h-3 w-3 mr-1" })}
                      {getAnalysisTypeInfo().label}
                    </Badge>
                  )}
                </div>
                {analysisType === 'enhanced_fine_dining' && (
                  <div className="text-sm text-muted-foreground mt-2">
                    🍽️ Enhanced restaurant supply chain analysis with customer behavior intelligence, inventory optimization, and restaurant tier classification.
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {analysis}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {!analysis && !isLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a week and click "Generate Insights" to view AI-powered sales analysis</p>
                  <p className="text-xs mt-2">
                    The system will automatically use enhanced restaurant intelligence analysis when available
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default WeeklyInsights;
