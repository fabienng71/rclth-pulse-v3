/**
 * Month header component for grouped return request table
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { MonthGroup } from '@/utils/monthGrouping';

interface MonthHeaderProps {
  monthGroup: MonthGroup;
  onToggleExpansion: (monthKey: string) => void;
  className?: string;
}

const MonthHeader: React.FC<MonthHeaderProps> = ({
  monthGroup,
  onToggleExpansion,
  className = ''
}) => {
  const { monthKey, displayName, isExpanded, summary } = monthGroup;

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'sent':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatStatusText = (status: string, count: number) => {
    const statusMap: Record<string, string> = {
      draft: 'Draft',
      sent: 'Sent',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  return (
    <div className={`border-b bg-muted/30 hover:bg-muted/50 transition-colors ${className}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpansion(monthKey)}
            className="p-1 h-8 w-8 hover:bg-background"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{displayName}</h3>
            <Badge variant="secondary" className="ml-2">
              {summary.totalRequests} request{summary.totalRequests !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Status breakdown badges */}
        <div className="flex items-center space-x-2">
          {Object.entries(summary.statusBreakdown)
            .filter(([, count]) => count > 0)
            .sort(([, a], [, b]) => b - a) // Sort by count descending
            .slice(0, 4) // Show only top 4 statuses
            .map(([status, count]) => (
              <Badge
                key={status}
                variant="outline"
                className={getStatusBadgeClass(status)}
              >
                {count} {formatStatusText(status, count)}
              </Badge>
            ))}
          
          {/* Show "..." if there are more than 4 different statuses */}
          {Object.keys(summary.statusBreakdown).length > 4 && (
            <Badge variant="outline" className="bg-gray-100 text-gray-600">
              +{Object.keys(summary.statusBreakdown).length - 4} more
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthHeader;