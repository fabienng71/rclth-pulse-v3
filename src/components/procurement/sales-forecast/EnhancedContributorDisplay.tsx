
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CollaborativeForecastData } from '@/hooks/useForecastSessions';

interface EnhancedContributorDisplayProps {
  forecasts: CollaborativeForecastData[];
}

export const EnhancedContributorDisplay: React.FC<EnhancedContributorDisplayProps> = ({
  forecasts
}) => {
  const totalQuantity = forecasts.reduce((sum, f) => sum + (f.forecast_quantity || 0), 0);
  
  if (forecasts.length === 0) {
    return <Badge variant="outline">No forecasts</Badge>;
  }

  const getContributorInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'UN';
  };

  const getContributorColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-3">
      {/* Total Quantity Display */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total:</span>
        <Badge variant="outline" className="font-bold text-lg px-3 py-1">
          {totalQuantity.toLocaleString()}
        </Badge>
      </div>

      {/* Individual Contributors */}
      <div className="space-y-2">
        {forecasts.map((forecast, index) => {
          const percentage = totalQuantity > 0 ? ((forecast.forecast_quantity || 0) / totalQuantity * 100) : 0;
          const contributorName = forecast.contributor_name || forecast.contributor_email || 'Unknown';
          
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className={`text-xs text-white ${getContributorColor(index)}`}>
                        {getContributorInitials(forecast.contributor_name, forecast.contributor_email)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {contributorName}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {(forecast.forecast_quantity || 0).toLocaleString()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${getContributorColor(index)}`}
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium">{contributorName}</p>
                    <p>Quantity: {(forecast.forecast_quantity || 0).toLocaleString()}</p>
                    <p>Percentage: {percentage.toFixed(1)}%</p>
                    {forecast.forecast_created_at && (
                      <p>Date: {new Date(forecast.forecast_created_at).toLocaleDateString()}</p>
                    )}
                    {forecast.item_notes && (
                      <p>Notes: {forecast.item_notes}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};
