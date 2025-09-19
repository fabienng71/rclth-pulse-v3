
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, Target, Users } from 'lucide-react';
import { CRMDashboardMetrics } from '@/hooks/useCRMDashboardData';

interface CRMInsightsSectionProps {
  metrics: CRMDashboardMetrics | null;
  isLoading: boolean;
}

interface Insight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

export const CRMInsightsSection = ({ metrics, isLoading }: CRMInsightsSectionProps) => {
  const generateInsights = (): Insight[] => {
    if (!metrics) return [];

    const insights: Insight[] = [];

    // Follow-up insights
    if (metrics.followUpsDue > 0) {
      insights.push({
        id: 'followups-due',
        type: 'warning',
        title: 'Follow-ups Overdue',
        description: `You have ${metrics.followUpsDue} follow-ups that require immediate attention.`,
        action: 'Review follow-ups',
        priority: 'high'
      });
    }

    // Conversion rate insights
    if (metrics.leadConversionRate < 10) {
      insights.push({
        id: 'low-conversion',
        type: 'critical',
        title: 'Low Conversion Rate',
        description: `Your lead conversion rate is ${metrics.leadConversionRate}%, which is below the recommended 15%.`,
        action: 'Improve lead qualification',
        priority: 'high'
      });
    } else if (metrics.leadConversionRate > 20) {
      insights.push({
        id: 'high-conversion',
        type: 'success',
        title: 'Excellent Conversion Rate',
        description: `Your conversion rate of ${metrics.leadConversionRate}% is performing excellently!`,
        priority: 'low'
      });
    }

    // Activity growth insights
    if (metrics.activitiesGrowth > 20) {
      insights.push({
        id: 'activity-growth',
        type: 'success',
        title: 'Strong Activity Growth',
        description: `Activities increased by ${metrics.activitiesGrowth}% this month. Great momentum!`,
        priority: 'medium'
      });
    } else if (metrics.activitiesGrowth < -10) {
      insights.push({
        id: 'activity-decline',
        type: 'warning',
        title: 'Activity Decline',
        description: `Activities decreased by ${Math.abs(metrics.activitiesGrowth)}% this month. Consider increasing outreach.`,
        priority: 'medium'
      });
    }

    // Additional filtered insights for the compact design
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 4); // Limit to top 4 insights for compact layout
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      case 'critical':
        return 'destructive';
      case 'info':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Skeleton className="h-4 w-4 mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const insights = generateInsights();

  return (
    <div className="space-y-4">
      {/* Smart Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Smart Insights</span>
          </CardTitle>
          <CardDescription>
            AI-powered recommendations based on your CRM performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">Everything looks great!</p>
              <p>No critical insights to display at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={getInsightBadgeVariant(insight.type)} className="text-xs">
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <Button variant="outline" size="sm">
                        {insight.action}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Performance Goals</span>
          </CardTitle>
          <CardDescription>
            Track your progress towards monthly targets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics && (
            <>
              {/* Activities Goal */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Activities</span>
                  <span>{metrics.thisMonthActivities} / 100</span>
                </div>
                <Progress value={(metrics.thisMonthActivities / 100) * 100} className="h-2" />
              </div>

              {/* Leads Goal */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>New Leads</span>
                  <span>{metrics.newLeadsThisMonth} / 20</span>
                </div>
                <Progress value={(metrics.newLeadsThisMonth / 20) * 100} className="h-2" />
              </div>

              {/* Conversion Goal */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Conversion Rate</span>
                  <span>{metrics.leadConversionRate}% / 15%</span>
                </div>
                <Progress value={(metrics.leadConversionRate / 15) * 100} className="h-2" />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
