
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ContactStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig = {
  active: {
    label: 'Active',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-100'
  },
  prospect: {
    label: 'Prospect',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
  },
  client: {
    label: 'Client',
    variant: 'default' as const,
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-100'
  },
  inactive: {
    label: 'Inactive',
    variant: 'outline' as const,
    className: 'bg-gray-100 text-gray-600 hover:bg-gray-100'
  },
  lead: {
    label: 'Lead',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
  }
};

export const ContactStatusBadge: React.FC<ContactStatusBadgeProps> = ({
  status,
  className
}) => {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};
