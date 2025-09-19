
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getVendorColor, getStatusColor, type TimelineShipment } from './utils/timelineUtils';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';

interface ShipmentTimelineBarProps {
  shipment: TimelineShipment;
  daysInMonth: number;
  stackIndex: number;
  todoProgress?: {
    completed: number;
    total: number;
    allCompleted: boolean;
  };
}

const ShipmentTimelineBar: React.FC<ShipmentTimelineBarProps> = ({
  shipment,
  daysInMonth,
  stackIndex,
  todoProgress
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/procurement/shipments/${shipment.id}/todo`);
  };

  // Calculate position and width
  const startPercent = ((shipment.startDay - 1) / daysInMonth) * 100;
  const widthPercent = (shipment.duration / daysInMonth) * 100;
  
  // Calculate vertical position for stacking
  const topOffset = stackIndex * 32; // 32px per bar including margin

  // Use vendor color instead of status color
  const vendorColor = getVendorColor(shipment.vendor_code);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusLabel = (status: TimelineShipment['status']) => {
    switch (status) {
      case 'on-schedule':
        return '🟢 On Schedule';
      case 'in-transit':
        return '🔵 In Transit';
      case 'approaching':
        return '🟡 Approaching ETA';
      case 'overdue':
        return '🔴 Overdue';
      default:
        return 'Unknown';
    }
  };

  // Calculate completion percentage
  const completionPercentage = todoProgress && todoProgress.total > 0 
    ? Math.round((todoProgress.completed / todoProgress.total) * 100)
    : 0;

  const tooltipContent = (
    <div className="space-y-1">
      <div className="font-medium">{shipment.vendor_name}</div>
      <div className="text-sm">
        <div>ETD: {formatDate(shipment.etd)}</div>
        <div>ETA: {formatDate(shipment.eta)}</div>
        <div>Transport: {shipment.transport_mode || 'Not specified'}</div>
        <div>Freight Forwarder: {shipment.freight_forwarder || 'Not specified'}</div>
        <div>Status: {getStatusLabel(shipment.status)}</div>
        {todoProgress && (
          <div className="border-t pt-1 mt-1">
            <div className="flex items-center gap-1">
              Todo Progress: {todoProgress.completed}/{todoProgress.total} ({completionPercentage}%)
              {todoProgress.allCompleted && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
            </div>
          </div>
        )}
        {shipment.isMultiMonth && (
          <div className="text-yellow-600 font-medium">Spans multiple months</div>
        )}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`absolute h-6 rounded cursor-pointer transition-all hover:opacity-80 hover:shadow-md ${vendorColor} flex items-center justify-between text-white text-xs font-medium relative overflow-hidden`}
            style={{
              left: `${startPercent}%`,
              width: `${widthPercent}%`,
              top: `${topOffset}px`,
              minWidth: '20px'
            }}
            onClick={handleClick}
          >
            <span className="truncate px-1 flex-1">
              {shipment.vendor_name}
            </span>
            
            {/* Completion percentage display */}
            {todoProgress && todoProgress.total > 0 && (
              <span className="px-1 text-xs font-semibold bg-black bg-opacity-20 rounded-sm ml-1">
                {completionPercentage}%
              </span>
            )}
            
            {shipment.isMultiMonth && (
              <span className="ml-1">→</span>
            )}
            
            {todoProgress?.allCompleted && (
              <CheckCircle className="h-3 w-3 ml-1 text-green-200" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ShipmentTimelineBar;
