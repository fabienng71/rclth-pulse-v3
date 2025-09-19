
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

interface SalespersonBadgeProps {
  name: string | null;
  className?: string;
}

export const SalespersonBadge: React.FC<SalespersonBadgeProps> = ({ 
  name, 
  className 
}) => {
  if (!name) {
    return (
      <span className="text-muted-foreground text-sm">
        Not assigned
      </span>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 text-xs max-w-full ${className}`}
    >
      <User className="h-3 w-3 flex-shrink-0" />
      <span className="truncate">{name}</span>
    </Badge>
  );
};
