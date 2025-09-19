
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';

interface ContactsStatsProps {
  totalContacts: number;
  activeContacts: number;
  highValueContacts: number;
  recentlyAdded: number;
  isLoading?: boolean;
}

export const ContactsStats: React.FC<ContactsStatsProps> = ({
  totalContacts,
  activeContacts,
  highValueContacts,
  recentlyAdded,
  isLoading = false
}) => {
  const stats = [
    {
      title: 'Total Contacts',
      value: totalContacts,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: recentlyAdded > 0 ? `+${recentlyAdded} this week` : undefined,
    },
    {
      title: 'Active Contacts',
      value: activeContacts,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      percentage: totalContacts > 0 ? Math.round((activeContacts / totalContacts) * 100) : 0,
    },
    {
      title: 'High Value',
      value: highValueContacts,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'High health score',
    },
    {
      title: 'Need Attention',
      value: totalContacts - activeContacts - highValueContacts,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Requires follow-up',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {stats.map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-6 w-12 bg-muted rounded" />
                </div>
                <div className="h-6 w-6 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold">
                    {stat.value.toLocaleString()}
                  </p>
                  {stat.percentage !== undefined && (
                    <Badge variant="secondary" className="text-xs h-4">
                      {stat.percentage}%
                    </Badge>
                  )}
                </div>
                {stat.change && (
                  <p className="text-xs text-green-600 font-medium">
                    {stat.change}
                  </p>
                )}
                {stat.description && (
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
              </div>
              <div className={`${stat.bgColor} p-2 rounded-full`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
