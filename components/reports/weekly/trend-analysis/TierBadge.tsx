import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  Package
} from 'lucide-react';

interface TierBadgeProps {
  tier: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier }) => {
  const config = {
    growing: { color: 'bg-soft-green text-green border-green/20', icon: TrendingUp },
    stable: { color: 'bg-soft-primary text-primary border-primary/20', icon: Sparkles },
    declining: { color: 'bg-soft-orange text-orange border-orange/20', icon: TrendingDown },
    lost: { color: 'bg-background-tertiary text-muted-foreground border-border/30', icon: AlertTriangle },
    seasonal: { color: 'bg-soft-secondary text-secondary border-secondary/20', icon: Package },
  };
  
  const { color, icon: Icon } = config[tier as keyof typeof config] || config.stable;
  
  return (
    <Badge className={color}>
      <Icon className="h-3 w-3 mr-1" />
      {tier}
    </Badge>
  );
};