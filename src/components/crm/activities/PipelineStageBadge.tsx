
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface PipelineStageBadgeProps {
  stage: string;
  className?: string;
  showIcon?: boolean;
}

const getStageColor = (stage: string): string => {
  switch (stage) {
    case 'Lead':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Qualified':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Proposal':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Closed Won':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Closed Lost':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStageIcon = (stage: string) => {
  switch (stage) {
    case 'Closed Won':
      return <CheckCircle className="h-3 w-3" />;
    case 'Closed Lost':
      return <XCircle className="h-3 w-3" />;
    default:
      return null;
  }
};

export const PipelineStageBadge: React.FC<PipelineStageBadgeProps> = ({ 
  stage, 
  className, 
  showIcon = true
}) => {
  const icon = showIcon ? getStageIcon(stage) : null;
  
  return (
    <Badge 
      variant="outline"
      className={`${getStageColor(stage)} ${className} flex items-center gap-1`}
    >
      {icon}
      {stage}
    </Badge>
  );
};
