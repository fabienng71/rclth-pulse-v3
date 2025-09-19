import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, TrendingUp, Zap } from 'lucide-react';
import { ItemsV2Filters } from '@/types/itemsV2';

interface QuickActionSectionProps {
  localFilters: ItemsV2Filters;
  updateFilter: (key: keyof ItemsV2Filters, value: any) => void;
}

export const QuickActionSection: React.FC<QuickActionSectionProps> = ({
  localFilters,
  updateFilter
}) => {
  const quickActions = [
    {
      key: 'my_top_performers' as keyof ItemsV2Filters,
      label: 'My Top Performers',
      description: 'High revenue, high margin items',
      icon: Star,
      color: 'text-yellow-500',
    },
    {
      key: 'quick_wins' as keyof ItemsV2Filters,
      label: 'Quick Wins',
      description: 'High margin, easy to sell',
      icon: Zap,
      color: 'text-green-500',
    },
    {
      key: 'customer_favorites' as keyof ItemsV2Filters,
      label: 'Customer Favorites',
      description: 'High demand, repeat purchases',
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      key: 'seasonal_opportunities' as keyof ItemsV2Filters,
      label: 'Seasonal Opportunities',
      description: 'Trending seasonal items',
      icon: Star,
      color: 'text-purple-500',
    },
    {
      key: 'has_reorder_alert' as keyof ItemsV2Filters,
      label: 'Reorder Alerts',
      description: 'Items needing restocking',
      icon: Zap,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Quick Actions</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <div key={action.key} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <Checkbox
                id={action.key}
                checked={localFilters[action.key] as boolean || false}
                onCheckedChange={(checked) => updateFilter(action.key, checked)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${action.color}`} />
                  <Label 
                    htmlFor={action.key} 
                    className="text-sm font-medium cursor-pointer"
                  >
                    {action.label}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};