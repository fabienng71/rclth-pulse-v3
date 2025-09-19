
import React, { useState, useEffect, useMemo } from 'react';
import { addMonths, subMonths, isToday, startOfMonth } from 'date-fns';
import { useShipments } from '@/hooks/useShipments';
import { supabase } from '@/integrations/supabase/client';
import TimelineNavigation from './TimelineNavigation';
import TimelineFilters from './TimelineFilters';
import ShipmentTimelineBar from './ShipmentTimelineBar';
import { 
  processShipmentsForTimeline, 
  getDayNumbers, 
  type VendorGroup,
  type TimelineShipment 
} from './utils/timelineUtils';

interface TodoProgress {
  completed: number;
  total: number;
  allCompleted: boolean;
}

const ShipmentTimeline: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [transportModeFilter, setTransportModeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [todoProgressData, setTodoProgressData] = useState<Record<string, TodoProgress>>({});
  
  // Fetch active shipments only
  const { shipments, loading, error, refetch } = useShipments(false);

  // Fetch todo progress for all shipments
  useEffect(() => {
    const fetchTodoProgress = async () => {
      if (!shipments.length) return;
      
      try {
        const { data, error } = await supabase
          .from('shipment_todos')
          .select('shipment_id, completion_stats, all_tasks_completed')
          .in('shipment_id', shipments.map(s => s.id));
          
        if (error) throw error;
        
        const progressMap: Record<string, TodoProgress> = {};
        data?.forEach(todo => {
          const stats = todo.completion_stats as any;
          progressMap[todo.shipment_id] = {
            completed: stats?.completed || 0,
            total: stats?.total || 0,
            allCompleted: todo.all_tasks_completed || false
          };
        });
        
        setTodoProgressData(progressMap);
      } catch (err) {
        console.error('Error fetching todo progress:', err);
      }
    };
    
    fetchTodoProgress();
  }, [shipments]);

  // Set up real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('shipment-timeline-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipments'
        },
        () => {
          console.log('Shipment data changed, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Process shipments for timeline
  const vendorGroups = useMemo(() => {
    if (!shipments.length) return [];
    return processShipmentsForTimeline(shipments, currentMonth);
  }, [shipments, currentMonth]);

  // Apply filters
  const filteredVendorGroups = useMemo(() => {
    return vendorGroups
      .map(group => ({
        ...group,
        shipments: group.shipments.filter(shipment => {
          // Transport mode filter
          if (transportModeFilter !== 'all' && shipment.transport_mode !== transportModeFilter) {
            return false;
          }
          
          // Status filter
          if (statusFilter !== 'all' && shipment.status !== statusFilter) {
            return false;
          }
          
          return true;
        })
      }))
      .filter(group => {
        // Vendor filter
        if (vendorFilter !== 'all' && group.vendorCode !== vendorFilter) {
          return false;
        }
        
        // Only show groups with shipments after filtering
        return group.shipments.length > 0;
      });
  }, [vendorGroups, transportModeFilter, statusFilter, vendorFilter]);

  // Get unique vendors for filter dropdown
  const vendors = useMemo(() => {
    return Array.from(
      new Map(
        shipments.map(s => [s.vendor_code, { code: s.vendor_code, name: s.vendor_name }])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [shipments]);

  // Generate day numbers for the current month
  const dayNumbers = getDayNumbers(currentMonth);

  // Check if a day is today
  const isDayToday = (day: number): boolean => {
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return isToday(dayDate);
  };

  // Navigation handlers
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // Filter handlers
  const handleClearFilters = () => {
    setTransportModeFilter('all');
    setStatusFilter('all');
    setVendorFilter('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading shipments: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TimelineNavigation
        currentMonth={currentMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onCurrentMonth={handleCurrentMonth}
      />

      <TimelineFilters
        transportModeFilter={transportModeFilter}
        statusFilter={statusFilter}
        vendorFilter={vendorFilter}
        vendors={vendors}
        onTransportModeChange={setTransportModeFilter}
        onStatusChange={setStatusFilter}
        onVendorChange={setVendorFilter}
        onClearFilters={handleClearFilters}
      />

      {filteredVendorGroups.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg font-medium">No shipments found</div>
          <div className="text-sm">
            Try adjusting your filters or select a different month
          </div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {/* Timeline header with day numbers */}
          <div className="bg-gray-50 border-b">
            <div className="flex">
              <div className="w-48 p-3 font-medium border-r bg-gray-100">
                Vendor
              </div>
              <div className="flex-1 flex">
                {dayNumbers.map(day => (
                  <div
                    key={day}
                    className={`flex-1 p-2 text-center text-xs border-r last:border-r-0 min-w-[20px] ${
                      isDayToday(day) 
                        ? 'bg-blue-100 text-blue-800 font-semibold' 
                        : 'bg-gray-50'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline content */}
          <div className="max-h-[600px] overflow-y-auto">
            {filteredVendorGroups.map((group) => {
              // Calculate row height based on number of stacked shipments
              const maxStack = Math.max(1, group.shipments.length);
              const rowHeight = maxStack * 32 + 16; // 32px per shipment + padding

              return (
                <div key={group.vendorCode} className="border-b last:border-b-0">
                  <div className="flex">
                    <div 
                      className="w-48 p-3 border-r bg-gray-50 flex items-start"
                      style={{ minHeight: `${rowHeight}px` }}
                    >
                      <div>
                        <div className="font-medium text-sm">{group.vendorName}</div>
                        <div className="text-xs text-gray-600">
                          {group.shipments.length} shipment{group.shipments.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div 
                      className="flex-1 relative"
                      style={{ minHeight: `${rowHeight}px` }}
                    >
                      {/* Day grid background */}
                      <div className="absolute inset-0 flex">
                        {dayNumbers.map(day => (
                          <div
                            key={day}
                            className={`flex-1 border-r last:border-r-0 min-w-[20px] ${
                              isDayToday(day) ? 'bg-blue-50' : ''
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Shipment bars */}
                      {group.shipments.map((shipment, index) => (
                        <ShipmentTimelineBar
                          key={shipment.id}
                          shipment={shipment}
                          daysInMonth={dayNumbers.length}
                          stackIndex={index}
                          todoProgress={todoProgressData[shipment.id]}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentTimeline;
