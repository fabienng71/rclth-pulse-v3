// Lead Intelligence Panel: Smart CRM UI Component
// Real-time lead scoring and creation recommendations

import React, { useState, memo } from 'react';
import { 
  Brain, 
  Lightbulb, 
  Plus, 
  Info, 
  Target,
  TrendingUp,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Clock,
  Users,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LeadIntelligencePanelProps, 
  ScoringBreakdown, 
  LeadScoringResult,
  SMART_CRM_CONSTANTS 
} from '@/types/smartCRM';
import { cn } from '@/lib/utils';

export const LeadIntelligencePanel: React.FC<LeadIntelligencePanelProps> = memo(({
  score,
  shouldCreate,
  leadTitle,
  onToggleCreate,
  onTitleChange,
  isLoading = false,
  scoringBreakdown = [],
  isEditMode = false
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  /**
   * Get color scheme based on score
   */
  const getScoreColorScheme = (score: number) => {
    if (score >= 100) return {
      border: 'border-green-200',
      bg: 'bg-green-50',
      text: 'text-green-600',
      badge: 'bg-green-100 text-green-800 border-green-200'
    };
    if (score >= 80) return {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    if (score >= 60) return {
      border: 'border-yellow-200',
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    if (score >= 40) return {
      border: 'border-orange-200',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      badge: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return {
      border: 'border-gray-200',
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      badge: 'bg-gray-100 text-gray-800 border-gray-200'
    };
  };

  /**
   * Get score message and icon
   */
  const getScoreMessage = (score: number) => {
    if (score >= 100) return {
      message: 'Excellent lead potential detected',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      recommendation: 'Highly recommended for lead creation'
    };
    if (score >= 80) return {
      message: 'High lead potential detected',
      icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
      recommendation: 'Strong candidate for lead creation'
    };
    if (score >= 60) return {
      message: 'Good lead potential detected',
      icon: <Target className="h-4 w-4 text-yellow-600" />,
      recommendation: 'Consider creating a lead'
    };
    if (score >= 40) return {
      message: 'Moderate lead potential',
      icon: <Info className="h-4 w-4 text-orange-600" />,
      recommendation: 'Manual review recommended'
    };
    return {
      message: 'Low lead potential',
      icon: <AlertCircle className="h-4 w-4 text-gray-600" />,
      recommendation: 'Lead creation optional'
    };
  };

  const colorScheme = getScoreColorScheme(score);
  const scoreMessage = getScoreMessage(score);
  const scorePercentage = Math.round((score / SMART_CRM_CONSTANTS.MAX_SCORE) * 100);

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            Lead Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="text-sm text-muted-foreground">
              Analyzing activity for lead potential...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'transition-all duration-300',
      colorScheme.border,
      colorScheme.bg
    )}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <span>Lead Intelligence</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI-powered analysis of lead potential based on activity details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant="outline" className={cn('text-sm font-medium', colorScheme.badge)}>
            {score}/{SMART_CRM_CONSTANTS.MAX_SCORE}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score Visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {scoreMessage.icon}
              <span className="text-sm font-medium">{scoreMessage.message}</span>
            </div>
            <span className={cn('text-lg font-bold', colorScheme.text)}>
              {scorePercentage}%
            </span>
          </div>
          
          <Progress 
            value={scorePercentage} 
            className="h-3 transition-all duration-500"
          />
          
          <p className="text-xs text-muted-foreground">
            {scoreMessage.recommendation}
          </p>
        </div>

        {/* Lead Creation Section */}
        {score >= 40 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="auto-create-lead" 
                checked={shouldCreate}
                onCheckedChange={onToggleCreate}
                className="border-2"
              />
              <Label 
                htmlFor="auto-create-lead" 
                className="flex items-center gap-2 text-sm font-medium cursor-pointer"
              >
                <Lightbulb className="h-4 w-4" />
                Create lead for this opportunity
              </Label>
            </div>
            
            {shouldCreate && (
              <div className="space-y-3 pl-6 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label htmlFor="lead-title" className="text-sm font-medium">
                    Lead Title
                  </Label>
                  <Input
                    id="lead-title"
                    value={leadTitle}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Enter lead title..."
                    className="bg-white border-primary/20 focus:border-primary"
                  />
                </div>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {isEditMode 
                      ? "A lead will be created automatically after updating this activity. You'll receive a notification when it's ready."
                      : "A lead will be created automatically after saving this activity. You'll receive a notification when it's ready."
                    }
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={() => onToggleCreate(true)}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Lead Manually
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              This activity has low lead potential, but you can still create a lead if needed.
            </p>
          </div>
        )}

        {/* Scoring Breakdown */}
        <Collapsible open={showBreakdown} onOpenChange={setShowBreakdown}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full p-0 h-auto hover:bg-transparent"
            >
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                View scoring breakdown
                <ChevronDown className={cn(
                  'h-3 w-3 transition-transform duration-200',
                  showBreakdown && 'rotate-180'
                )} />
              </div>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 mt-3">
            {scoringBreakdown.length > 0 ? (
              <ScoringBreakdownDisplay breakdown={scoringBreakdown} />
            ) : (
              <div className="text-xs text-muted-foreground text-center py-2">
                Scoring breakdown not available
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
});

/**
 * Scoring Breakdown Display Component
 */
interface ScoringBreakdownDisplayProps {
  breakdown: ScoringBreakdown[];
}

const ScoringBreakdownDisplay: React.FC<ScoringBreakdownDisplayProps> = ({ breakdown }) => {
  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case 'activityType': return <MessageSquare className="h-3 w-3" />;
      case 'pipelineStage': return <TrendingUp className="h-3 w-3" />;
      case 'keywordMatches': return <Target className="h-3 w-3" />;
      case 'customerEngagement': return <Users className="h-3 w-3" />;
      case 'estimatedValue': return <DollarSign className="h-3 w-3" />;
      case 'historicalSuccess': return <Clock className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground mb-2">
        Scoring Factors
      </h4>
      
      {breakdown.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFactorIcon(item.factor)}
              <span className="text-xs font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {item.score}/{item.maxScore}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Progress 
              value={(item.score / item.maxScore) * 100} 
              className="h-1 flex-1"
            />
            <span className="text-xs font-medium w-8 text-right">
              {Math.round((item.score / item.maxScore) * 100)}%
            </span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground cursor-help">
                  {item.explanation}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{item.explanation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  );
};

export default LeadIntelligencePanel;