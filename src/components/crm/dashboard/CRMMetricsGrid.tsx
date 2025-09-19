
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Activity, Users, FolderKanban, UserPlus, AlertCircle, Calendar, TrendingUp, Clock } from 'lucide-react';
import { CRMDashboardMetrics } from '@/hooks/useCRMDashboardData';

interface CRMMetricsGridProps {
  metrics: CRMDashboardMetrics | null;
  isLoading: boolean;
  compact?: boolean;
}

export const CRMMetricsGrid = ({ metrics, isLoading, compact = false }: CRMMetricsGridProps) => {
  if (isLoading) {
    return (
      <div className={compact ? "flex gap-4 flex-wrap" : "grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6"}>
        {Array.from({ length: compact ? 4 : 8 }).map((_, index) => (
          <Card key={index} className={compact ? "w-28 h-16" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthBadgeVariant = (growth: number) => {
    if (growth > 0) return 'default';
    if (growth < 0) return 'destructive';
    return 'secondary';
  };

  // Compact version is used in other places but not on the main dashboard anymore
  if (compact) {
    return (
      <div className="flex gap-3 flex-wrap">
        {/* Activities */}
        <Card className="w-28 h-16 p-0">
          <CardContent className="p-2 flex flex-col items-center justify-center h-full">
            <div className="flex items-center justify-center gap-1">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">Activities</span>
            </div>
            <div className="text-base font-bold">{metrics.totalActivities}</div>
            <Badge variant={getGrowthBadgeVariant(metrics.activitiesGrowth)} className="text-[0.6rem] px-1 py-0 h-4">
              {metrics.activitiesGrowth > 0 ? '+' : ''}{metrics.activitiesGrowth}%
            </Badge>
          </CardContent>
        </Card>

        {/* Leads */}
        <Card className="w-28 h-16 p-0">
          <CardContent className="p-2 flex flex-col items-center justify-center h-full">
            <div className="flex items-center justify-center gap-1">
              <UserPlus className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">Leads</span>
            </div>
            <div className="text-base font-bold">{metrics.totalLeads}</div>
            <Badge variant={getGrowthBadgeVariant(metrics.leadsGrowth)} className="text-[0.6rem] px-1 py-0 h-4">
              {metrics.leadsGrowth > 0 ? '+' : ''}{metrics.leadsGrowth}%
            </Badge>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="w-28 h-16 p-0">
          <CardContent className="p-2 flex flex-col items-center justify-center h-full">
            <div className="flex items-center justify-center gap-1">
              <FolderKanban className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">Projects</span>
            </div>
            <div className="text-base font-bold">{metrics.activeProjects}</div>
            <Badge variant={getGrowthBadgeVariant(metrics.projectsGrowth)} className="text-[0.6rem] px-1 py-0 h-4">
              {metrics.projectsGrowth > 0 ? '+' : ''}{metrics.projectsGrowth}%
            </Badge>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card className="w-28 h-16 p-0">
          <CardContent className="p-2 flex flex-col items-center justify-center h-full">
            <div className="flex items-center justify-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">Contacts</span>
            </div>
            <div className="text-base font-bold">{metrics.totalContacts}</div>
            <Badge variant={getGrowthBadgeVariant(metrics.contactsGrowth)} className="text-[0.6rem] px-1 py-0 h-4">
              {metrics.contactsGrowth > 0 ? '+' : ''}{metrics.contactsGrowth}%
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Original full version preserved for potential use elsewhere
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalActivities}</div>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-muted-foreground">
              {metrics.thisMonthActivities} this month
            </p>
            <Badge variant={getGrowthBadgeVariant(metrics.activitiesGrowth)} className="text-xs">
              {metrics.activitiesGrowth > 0 ? '+' : ''}{metrics.activitiesGrowth}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Total Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalLeads}</div>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-muted-foreground">
              {metrics.newLeadsThisMonth} new this month
            </p>
            <Badge variant={getGrowthBadgeVariant(metrics.leadsGrowth)} className="text-xs">
              {metrics.leadsGrowth > 0 ? '+' : ''}{metrics.leadsGrowth}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeProjects}</div>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-muted-foreground">
              {metrics.totalProjects} total projects
            </p>
            <Badge variant={getGrowthBadgeVariant(metrics.projectsGrowth)} className="text-xs">
              {metrics.projectsGrowth > 0 ? '+' : ''}{metrics.projectsGrowth}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Total Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalContacts}</div>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-muted-foreground">
              {metrics.newContactsThisMonth} new this month
            </p>
            <Badge variant={getGrowthBadgeVariant(metrics.contactsGrowth)} className="text-xs">
              {metrics.contactsGrowth > 0 ? '+' : ''}{metrics.contactsGrowth}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lead Conversion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.leadConversionRate}%</div>
          <div className="mt-2">
            <Progress value={metrics.leadConversionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Average Response Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageResponseTime}h</div>
          <p className="text-xs text-muted-foreground">
            Average response time
          </p>
        </CardContent>
      </Card>

      {/* Pending Sample Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sample Requests</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.pendingSampleRequests}</div>
          <p className="text-xs text-muted-foreground">
            Pending approval
          </p>
        </CardContent>
      </Card>

      {/* Follow-ups Due */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{metrics.followUpsDue}</div>
          <p className="text-xs text-muted-foreground">
            Require attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
