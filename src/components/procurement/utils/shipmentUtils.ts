
import { format, isPast } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateWithLabel = (label: string, date: string | null | undefined) => {
  if (!date) return null;
  const formattedDate = format(new Date(date), 'MMM dd, yyyy');
  return {
    label: label,
    formattedDate: formattedDate,
  };
};

export type DaysInfoStatus = 'overdue' | 'upcoming' | 'none';

export const getDaysInfo = (date: string | null | undefined, type: 'departure' | 'arrival') => {
  if (!date) return null;

  const parsedDate = new Date(date);
  const today = new Date();
  
  // Set both dates to midnight to compare just the dates without time
  parsedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // Calculate the difference in days
  const diffInDays = Math.floor((parsedDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  const absoluteDiff = Math.abs(diffInDays);

  let status: DaysInfoStatus = 'none';
  
  // Only mark as "none" if it's exactly the same day
  if (diffInDays === 0) {
    status = 'none';
  } else if (diffInDays < 0) {
    status = 'overdue';
  } else {
    status = 'upcoming';
  }

  return {
    days: absoluteDiff,
    status: status,
    type: type,
  };
};

// Updated function to get item count from the database
export const getItemsCount = async (shipmentId: string) => {
  try {
    // Query the shipment_items table to get the count of items for this shipment
    const { data, error, count } = await supabase
      .from('shipment_items')
      .select('*', { count: 'exact', head: false })
      .eq('shipment_id', shipmentId);
    
    if (error) {
      console.error('Error fetching shipment items:', error);
      return { count: 0 };
    }
    
    return { count: count || 0 };
  } catch (error) {
    console.error('Error in getItemsCount:', error);
    return { count: 0 };
  }
};

// Updated to align with StatusBadge component values
export const determineShipmentStatus = (etd: string | null, eta: string | null): string => {
  const today = new Date();
  
  if (!etd) {
    return 'pending';
  }
  
  const etdDate = new Date(etd);
  
  if (etdDate > today) {
    return 'pending';
  }
  
  if (eta) {
    const etaDate = new Date(eta);
    
    if (etaDate <= today) {
      return 'delivered';
    }
    
    // Check if ETA is delayed
    const originalEtaToEtdDays = Math.round((new Date(eta).getTime() - new Date(etd).getTime()) / (1000 * 60 * 60 * 24));
    const currentDaysSinceEtd = Math.round((today.getTime() - new Date(etd).getTime()) / (1000 * 60 * 60 * 24));
    
    if (currentDaysSinceEtd > originalEtaToEtdDays * 1.5) {
      return 'delayed';
    }
  }
  
  return 'in_transit';
};
