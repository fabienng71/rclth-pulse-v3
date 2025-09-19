
import { differenceInDays, startOfMonth, endOfMonth, getDaysInMonth, format, isAfter, isBefore, isToday } from 'date-fns';
import type { Shipment } from '@/hooks/useShipments';

export interface TimelineShipment extends Shipment {
  startDay: number;
  endDay: number;
  duration: number;
  status: 'on-schedule' | 'in-transit' | 'approaching' | 'overdue';
  isMultiMonth: boolean;
  itemsCount?: number;
}

export interface VendorGroup {
  vendorCode: string;
  vendorName: string;
  shipments: TimelineShipment[];
  earliestEta?: Date | null;
}

// Vendor color palette - distinct colors for easy identification
const VENDOR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-amber-500',
  'bg-lime-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-sky-500',
  'bg-green-500',
  'bg-red-500'
];

// Generate consistent color for vendor based on vendor code
export const getVendorColor = (vendorCode: string): string => {
  let hash = 0;
  for (let i = 0; i < vendorCode.length; i++) {
    const char = vendorCode.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % VENDOR_COLORS.length;
  return VENDOR_COLORS[index];
};

export const getShipmentStatus = (etd: string | null, eta: string | null): TimelineShipment['status'] => {
  const today = new Date();
  
  if (!eta) return 'on-schedule';
  
  const etaDate = new Date(eta);
  const etdDate = etd ? new Date(etd) : null;
  
  // Overdue - ETA has passed
  if (isBefore(etaDate, today)) {
    return 'overdue';
  }
  
  // Approaching - ETA is within 3 days
  const daysToEta = differenceInDays(etaDate, today);
  if (daysToEta <= 3) {
    return 'approaching';
  }
  
  // In transit - ETD has passed but ETA is still future
  if (etdDate && (isBefore(etdDate, today) || isToday(etdDate))) {
    return 'in-transit';
  }
  
  // On schedule - ETD is future and ETA is more than 3 days away
  return 'on-schedule';
};

export const getStatusColor = (status: TimelineShipment['status']): string => {
  switch (status) {
    case 'on-schedule':
      return 'bg-green-500';
    case 'in-transit':
      return 'bg-blue-500';
    case 'approaching':
      return 'bg-yellow-500';
    case 'overdue':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export const processShipmentsForTimeline = (
  shipments: Shipment[],
  selectedMonth: Date
): VendorGroup[] => {
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const daysInMonth = getDaysInMonth(selectedMonth);
  
  // Filter shipments that have dates overlapping with the selected month
  const relevantShipments = shipments.filter(shipment => {
    if (!shipment.etd && !shipment.eta) return false;
    
    const etd = shipment.etd ? new Date(shipment.etd) : null;
    const eta = shipment.eta ? new Date(shipment.eta) : null;
    
    // Include if either ETD or ETA falls within the month, or if the shipment spans the entire month
    const etdInMonth = etd && etd >= monthStart && etd <= monthEnd;
    const etaInMonth = eta && eta >= monthStart && eta <= monthEnd;
    const spansMonth = etd && eta && etd < monthStart && eta > monthEnd;
    
    return etdInMonth || etaInMonth || spansMonth;
  });
  
  // Process each shipment for timeline positioning
  const timelineShipments: TimelineShipment[] = relevantShipments.map(shipment => {
    const etd = shipment.etd ? new Date(shipment.etd) : null;
    const eta = shipment.eta ? new Date(shipment.eta) : null;
    
    let startDay = 1;
    let endDay = daysInMonth;
    let isMultiMonth = false;
    
    if (etd && etd >= monthStart && etd <= monthEnd) {
      startDay = etd.getDate();
    } else if (etd && etd < monthStart) {
      startDay = 1;
      isMultiMonth = true;
    }
    
    if (eta && eta >= monthStart && eta <= monthEnd) {
      endDay = eta.getDate();
    } else if (eta && eta > monthEnd) {
      endDay = daysInMonth;
      isMultiMonth = true;
    }
    
    // Calculate duration in days
    const duration = endDay - startDay + 1;
    
    return {
      ...shipment,
      startDay,
      endDay,
      duration,
      status: getShipmentStatus(shipment.etd, shipment.eta),
      isMultiMonth
    };
  });
  
  // Group by vendor
  const vendorGroups: { [key: string]: VendorGroup } = {};
  
  timelineShipments.forEach(shipment => {
    const key = shipment.vendor_code;
    if (!vendorGroups[key]) {
      vendorGroups[key] = {
        vendorCode: shipment.vendor_code,
        vendorName: shipment.vendor_name,
        shipments: [],
        earliestEta: null
      };
    }
    vendorGroups[key].shipments.push(shipment);
    
    // Track earliest ETA for sorting
    if (shipment.eta) {
      const etaDate = new Date(shipment.eta);
      if (!vendorGroups[key].earliestEta || etaDate < vendorGroups[key].earliestEta!) {
        vendorGroups[key].earliestEta = etaDate;
      }
    }
  });
  
  // Sort vendor groups by earliest ETA, then by name for vendors without ETA
  return Object.values(vendorGroups)
    .map(group => ({
      ...group,
      shipments: group.shipments.sort((a, b) => a.startDay - b.startDay)
    }))
    .sort((a, b) => {
      // If both have ETA, sort by earliest ETA
      if (a.earliestEta && b.earliestEta) {
        return a.earliestEta.getTime() - b.earliestEta.getTime();
      }
      // If only one has ETA, prioritize it
      if (a.earliestEta && !b.earliestEta) return -1;
      if (!a.earliestEta && b.earliestEta) return 1;
      // If neither has ETA, sort alphabetically
      return a.vendorName.localeCompare(b.vendorName);
    });
};

export const formatMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const getDayNumbers = (month: Date): number[] => {
  const daysInMonth = getDaysInMonth(month);
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
};
