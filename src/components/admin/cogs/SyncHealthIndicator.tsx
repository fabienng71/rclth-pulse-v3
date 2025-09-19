import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { useCogsSyncHealth } from '@/hooks/useCogsSync';

export const SyncHealthIndicator: React.FC = () => {
  const { status, message, syncPercentage, lastSyncAge, isLoading } = useCogsSyncHealth();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className={`h-5 w-5 ${getStatusColor()}`} />;
      case 'warning': return <AlertTriangle className={`h-5 w-5 ${getStatusColor()}`} />;
      case 'critical': return <AlertCircle className={`h-5 w-5 ${getStatusColor()}`} />;
      default: return <Clock className={`h-5 w-5 ${getStatusColor()}`} />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          {lastSyncAge !== null && (
            <span className="text-sm text-muted-foreground">
              Last sync: {lastSyncAge < 1 ? '< 1h' : `${Math.round(lastSyncAge)}h`} ago
            </span>
          )}
        </div>
        <div className="space-y-2">
          <div className="text-sm">{message}</div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Sync Progress</span>
              <span>{syncPercentage}%</span>
            </div>
            <Progress value={syncPercentage} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};