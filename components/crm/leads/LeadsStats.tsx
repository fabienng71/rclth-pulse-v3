
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, UserCheck, Trophy, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LeadsStatsProps {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  recentlyAdded: number;
  isLoading?: boolean;
}

export const LeadsStats = ({ 
  totalLeads, 
  activeLeads, 
  convertedLeads, 
  recentlyAdded, 
  isLoading = false 
}: LeadsStatsProps) => {
  const stats = [
    {
      title: 'Total Leads',
      value: totalLeads,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Active Leads',
      value: activeLeads,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Converted',
      value: convertedLeads,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Added This Week',
      value: recentlyAdded,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`p-6 border ${stat.borderColor} hover:shadow-md transition-shadow`}>
            <div className="flex items-center space-x-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
