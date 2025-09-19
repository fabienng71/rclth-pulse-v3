import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Package, 
  Users, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { LeadCenter } from '@/types/leadCenter';
import { aiLeadScoringService, LeadScoringResult, ChannelCompatibilityScore } from '@/services/aiLeadScoring';
import { getChannelInfo, getChannelBadgeColor } from '@/utils/channelMapping';
import { supabase } from '@/lib/supabase';

interface AILeadIntelligenceProps {
  lead: LeadCenter;
  onRefresh?: () => void;
}

export const AILeadIntelligence: React.FC<AILeadIntelligenceProps> = ({ lead, onRefresh }) => {
  const [scoringResult, setScoringResult] = useState<LeadScoringResult | null>(null);
  const [channelScore, setChannelScore] = useState<ChannelCompatibilityScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedChannel, setDetectedChannel] = useState<string | null>(null);

  useEffect(() => {
    loadAIInsights();
  }, [lead.id]);

  // Function to detect channel from customer data if not directly specified
  const detectChannelFromCustomer = async (): Promise<string | null> => {
    if (!lead.customer_id) return null;
    
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('customer_type_code')
        .eq('customer_code', lead.customer_id)
        .single();
      
      if (error || !customer?.customer_type_code) {
        return null;
      }
      
      return customer.customer_type_code;
    } catch (error) {
      console.warn('Error detecting channel from customer:', error);
      return null;
    }
  };

  const loadAIInsights = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Determine channel to use - either from lead or detected from customer
      let channelToUse = lead.customer_channel;
      let detectedFromCustomer = null;
      
      if (!channelToUse) {
        detectedFromCustomer = await detectChannelFromCustomer();
        channelToUse = detectedFromCustomer;
      }
      
      setDetectedChannel(detectedFromCustomer);
      
      const [scoring, channel] = await Promise.all([
        aiLeadScoringService.scoreLeadWithAI(lead),
        channelToUse ? aiLeadScoringService.calculateChannelCompatibility(channelToUse) : null
      ]);
      
      setScoringResult(scoring);
      setChannelScore(channel);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI insights');
      console.error('AI insights error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Lead Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Analyzing lead data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Lead Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={loadAIInsights}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!scoringResult) return null;

  // Use detected channel if no direct channel is specified
  const effectiveChannel = lead.customer_channel || detectedChannel;
  const channelInfo = effectiveChannel ? getChannelInfo(effectiveChannel) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Lead Intelligence
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getScoreBadgeVariant(scoringResult.score)}>
              Score: {scoringResult.score}/100
            </Badge>
            <Button size="sm" variant="ghost" onClick={loadAIInsights}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="channel">Channel</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Lead Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lead Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(scoringResult.score)}`}>
                    {scoringResult.score}
                  </span>
                </div>
                <Progress value={scoringResult.score} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Confidence: {Math.round(scoringResult.confidence * 100)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conversion Probability</span>
                  <span className="text-lg font-semibold">
                    {Math.round((scoringResult.score / 100) * (lead.close_probability || 20))}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Timeline: {scoringResult.recommendations.timeline}
                </div>
              </div>
            </div>

            {/* Scoring Factors */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Scoring Factors</h4>
              
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">Channel Compatibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={scoringResult.factors.channelCompatibility} className="w-20 h-1" />
                    <span className="text-xs w-8">{Math.round(scoringResult.factors.channelCompatibility)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">Deal Value</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={scoringResult.factors.estimatedValue} className="w-20 h-1" />
                    <span className="text-xs w-8">{Math.round(scoringResult.factors.estimatedValue)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Sales Stage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={scoringResult.factors.salesStage} className="w-20 h-1" />
                    <span className="text-xs w-8">{Math.round(scoringResult.factors.salesStage)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Activity & Timing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={scoringResult.factors.timeFactors} className="w-20 h-1" />
                    <span className="text-xs w-8">{Math.round(scoringResult.factors.timeFactors)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="channel" className="space-y-4">
            {channelScore && channelInfo ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getChannelBadgeColor(channelInfo.category)}>
                    {channelInfo.code}
                  </Badge>
                  <span className="font-medium">{channelInfo.name}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Channel Compatibility</span>
                      <span className={`text-lg font-bold ${getScoreColor(channelScore.score)}`}>
                        {channelScore.score}/100
                      </span>
                    </div>
                    <Progress value={channelScore.score} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Typical Order Size:</span> {channelScore.typicalOrderSize}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Sales Cycle:</span> {channelScore.salesCycleLength}
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">Channel Analysis:</span>
                    <p className="mt-1 text-muted-foreground">{channelScore.reasoning}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    {!lead.customer_id 
                      ? "No customer selected for this lead"
                      : detectedChannel === null 
                        ? "No channel information found for this customer"
                        : "No customer channel specified for this lead"
                    }
                  </span>
                </div>
                
                {detectedChannel && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800 text-sm">
                      <Lightbulb className="h-4 w-4" />
                      <span className="font-medium">Channel detected from customer data:</span>
                      <Badge variant="outline" className="text-blue-700 border-blue-300">
                        {getChannelInfo(detectedChannel)?.name || detectedChannel}
                      </Badge>
                    </div>
                    <p className="text-blue-700 text-xs mt-1">
                      Consider updating the lead to use this channel information.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="products" className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Recommended Products
              </h4>
              
              {scoringResult.recommendations.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scoringResult.recommendations.products.map((product, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{product}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No specific product recommendations available. Consider updating the customer channel information.
                </div>
              )}
              
              {channelInfo && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm">
                    <span className="font-medium text-blue-900">Channel Focus:</span>
                    <p className="mt-1 text-blue-700">{channelInfo.description}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recommended Actions
              </h4>
              
              {scoringResult.recommendations.nextActions.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="mt-0.5">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-amber-800">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-amber-900">{action}</p>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Expected Timeline:</span> {scoringResult.recommendations.timeline}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};