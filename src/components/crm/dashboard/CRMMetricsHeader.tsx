
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, UserPlus, FolderKanban, Users } from 'lucide-react';
import { CRMDashboardMetrics } from '@/hooks/useCRMDashboardData';

interface CRMMetricsHeaderProps {
  metrics: CRMDashboardMetrics | null;
  isLoading: boolean;
}

export const CRMMetricsHeader = ({ metrics, isLoading }: CRMMetricsHeaderProps) => {
  return (
    <div className="section-background p-6 rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Dashboard Title */}
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold md:text-3xl bg-gradient-primary bg-clip-text text-transparent">
            CRM Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your customer relationship management activities
          </p>
        </div>

        {/* Top Metrics (Compact) */}
        {isLoading ? (
          <div className="flex flex-wrap gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-28" />
            ))}
          </div>
        ) : metrics ? (
          <div className="flex flex-wrap gap-3">
            {/* Activities */}
            <Card className="w-28 h-16 p-0">
              <CardContent className="p-2 flex flex-col items-center justify-center h-full">
                <div className="flex items-center justify-center gap-1">
                  <Activity className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">Activities</span>
                </div>
                <div className="text-base font-bold">{metrics.totalActivities}</div>
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
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};
