
import { supabase } from '@/integrations/supabase/client';
import { determineShipmentStatus } from '@/components/procurement/utils/shipmentUtils';
import type { IncomingStockItem, StockProjection } from './types';

export const fetchIncomingStockForItem = async (itemCode: string): Promise<IncomingStockItem[]> => {
  try {
    console.log(`[IncomingStock] Fetching incoming stock for item: "${itemCode}"`);
    
    // Normalize item code - trim whitespace and handle case sensitivity
    const normalizedItemCode = itemCode.trim();
    
    // Fetch all active shipments with better logging
    const { data: shipmentsData, error: shipmentsError } = await supabase
      .from('shipments')
      .select('*')
      .or('archive.is.null,archive.eq.false');

    if (shipmentsError) {
      console.error('[IncomingStock] Error fetching shipments:', shipmentsError);
      throw shipmentsError;
    }

    console.log(`[IncomingStock] Found ${shipmentsData?.length || 0} total shipments`);

    // Filter shipments with improved status logic
    const activeShipments = (shipmentsData || []).filter(shipment => {
      const status = determineShipmentStatus(shipment.etd, shipment.eta);
      const isActive = status === 'pending' || status === 'in_transit';
      
      // Also include shipments that don't have status but are not archived
      const hasNoStatus = !shipment.etd && !shipment.eta && !shipment.archive;
      
      return isActive || hasNoStatus;
    });

    console.log(`[IncomingStock] Found ${activeShipments.length} active shipments after status filtering`);

    const incomingStockItems: IncomingStockItem[] = [];

    // For each active shipment, check if it contains our item with improved matching
    for (const shipment of activeShipments) {
      try {
        // Try exact match first
        let { data: itemsData, error: itemsError } = await supabase
          .from('shipment_items')
          .select('*')
          .eq('shipment_id', shipment.id)
          .eq('item_code', normalizedItemCode);

        // If no exact match, try case-insensitive match
        if (itemsError || !itemsData || itemsData.length === 0) {
          const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabase
            .from('shipment_items')
            .select('*')
            .eq('shipment_id', shipment.id)
            .ilike('item_code', normalizedItemCode);

          if (!caseInsensitiveError && caseInsensitiveData && caseInsensitiveData.length > 0) {
            console.log(`[IncomingStock] Found case-insensitive match for ${normalizedItemCode} in shipment ${shipment.id}`);
            itemsData = caseInsensitiveData;
            itemsError = null;
          }
        }

        if (itemsError) {
          console.error(`[IncomingStock] Error fetching items for shipment ${shipment.id}:`, itemsError);
          continue;
        }

        if (itemsData && itemsData.length > 0) {
          console.log(`[IncomingStock] Found ${itemsData.length} items for shipment ${shipment.id}`);
          
          for (const item of itemsData) {
            const incomingItem: IncomingStockItem = {
              shipment_id: shipment.id,
              eta: shipment.eta || '',
              quantity: item.quantity || 0,
              transport_mode: shipment.transport_mode || '',
              vendor_code: shipment.vendor_code,
              vendor_name: shipment.vendor_name
            };
            
            incomingStockItems.push(incomingItem);
            console.log(`[IncomingStock] Added incoming stock item:`, incomingItem);
          }
        }
      } catch (error) {
        console.error(`[IncomingStock] Error processing shipment ${shipment.id}:`, error);
        continue;
      }
    }

    const totalIncomingQuantity = incomingStockItems.reduce((sum, item) => sum + item.quantity, 0);
    console.log(`[IncomingStock] Total incoming stock for ${normalizedItemCode}: ${totalIncomingQuantity} units across ${incomingStockItems.length} shipments`);

    // Enhanced logging for debugging
    incomingStockItems.forEach((item, index) => {
      console.log(`[IncomingStock] Item ${index + 1}: ${item.quantity} units, ETA: "${item.eta}", Shipment: ${item.shipment_id}`);
    });

    return incomingStockItems;
  } catch (error) {
    console.error('[IncomingStock] Error fetching incoming stock for item:', itemCode, error);
    return [];
  }
};

export const calculateProjectedStockTimeline = (
  currentStock: number,
  dailyConsumption: number,
  incomingStock: IncomingStockItem[],
  forecastDays: number = 180
): StockProjection[] => {
  console.log(`[StockProjection] Starting calculation with:`);
  console.log(`[StockProjection] - Current stock: ${currentStock}`);
  console.log(`[StockProjection] - Daily consumption: ${dailyConsumption}`);
  console.log(`[StockProjection] - Incoming items: ${incomingStock.length}`);
  console.log(`[StockProjection] - Forecast days: ${forecastDays}`);
  
  const timeline: StockProjection[] = [];
  const today = new Date();
  let runningStock = currentStock;

  // Enhanced ETA validation and sorting
  const validIncomingStock = incomingStock.filter(item => {
    if (!item.eta || item.eta.trim() === '') {
      console.log(`[StockProjection] Skipping item with missing ETA:`, item);
      return false;
    }
    
    const etaDate = new Date(item.eta);
    if (isNaN(etaDate.getTime())) {
      console.log(`[StockProjection] Skipping item with invalid ETA "${item.eta}":`, item);
      return false;
    }
    
    return true;
  });

  // Calculate the maximum ETA date to extend forecast days if needed
  let maxEtaDate = today;
  if (validIncomingStock.length > 0) {
    const etaDates = validIncomingStock.map(item => new Date(item.eta));
    maxEtaDate = new Date(Math.max(...etaDates.map(date => date.getTime())));
    
    // Extend forecast days to cover all incoming stock plus buffer
    const daysToMaxEta = Math.ceil((maxEtaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const extendedForecastDays = Math.max(forecastDays, daysToMaxEta + 30); // 30 days buffer
    
    if (extendedForecastDays > forecastDays) {
      console.log(`[StockProjection] Extending forecast from ${forecastDays} to ${extendedForecastDays} days to cover all incoming stock`);
      forecastDays = extendedForecastDays;
    }
  }

  const sortedIncoming = validIncomingStock.sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime());

  console.log(`[StockProjection] Valid incoming stock after filtering and sorting:`);
  sortedIncoming.forEach((item, index) => {
    const etaDate = new Date(item.eta);
    const daysFromNow = Math.ceil((etaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`[StockProjection] ${index + 1}. ${item.quantity} units on ${item.eta} (${daysFromNow} days from now)`);
  });

  for (let day = 0; day <= forecastDays; day++) {
    const currentDate = new Date(today.getTime() + day * 24 * 60 * 60 * 1000);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Check for incoming deliveries on this date
    const deliveriesToday = sortedIncoming.filter(item => {
      const etaDate = new Date(item.eta);
      return etaDate.toISOString().split('T')[0] === dateStr;
    });

    const incomingQuantity = deliveriesToday.reduce((sum, item) => sum + item.quantity, 0);

    // Apply daily consumption (except for day 0)
    if (day > 0) {
      runningStock -= dailyConsumption;
    }

    // Add incoming stock
    runningStock += incomingQuantity;

    const projectedStock = Math.max(0, runningStock);

    timeline.push({
      date: dateStr,
      projected_stock: projectedStock,
      consumption: day > 0 ? dailyConsumption : 0,
      incoming_delivery: incomingQuantity
    });

    // Enhanced logging for key dates
    if (incomingQuantity > 0 || day <= 10 || day % 30 === 0) {
      console.log(`[StockProjection] Day ${day} (${dateStr}): Stock=${projectedStock.toFixed(1)}, Consumption=${day > 0 ? dailyConsumption.toFixed(1) : 0}, Incoming=${incomingQuantity}`);
    }

    // Stop if stock reaches zero and no more deliveries
    if (projectedStock <= 0 && !sortedIncoming.some(item => new Date(item.eta) > currentDate)) {
      console.log(`[StockProjection] Stock depleted on day ${day}, ending calculation`);
      break;
    }
  }

  console.log(`[StockProjection] Generated ${timeline.length} days of projection`);
  return timeline;
};

export const calculateEffectiveDaysUntilStockout = (
  currentStock: number,
  dailyConsumption: number,
  incomingStock: IncomingStockItem[]
): number => {
  console.log(`[EffectiveStockout] Starting calculation:`);
  console.log(`[EffectiveStockout] - Current stock: ${currentStock}`);
  console.log(`[EffectiveStockout] - Daily consumption: ${dailyConsumption}`);
  console.log(`[EffectiveStockout] - Incoming stock items: ${incomingStock.length}`);
  
  if (dailyConsumption <= 0) {
    console.log(`[EffectiveStockout] No consumption, returning 999 days`);
    return 999;
  }

  // If no incoming stock, calculate simply
  if (incomingStock.length === 0) {
    const result = Math.floor(currentStock / dailyConsumption);
    console.log(`[EffectiveStockout] No incoming stock, simple calculation: ${currentStock} / ${dailyConsumption} = ${result} days`);
    return result;
  }

  // Calculate total incoming stock and theoretical maximum days
  const totalIncoming = incomingStock.reduce((sum, item) => sum + item.quantity, 0);
  const totalStock = currentStock + totalIncoming;
  const theoreticalMaxDays = Math.floor(totalStock / dailyConsumption);
  
  console.log(`[EffectiveStockout] Total stock: ${totalStock} (${currentStock} + ${totalIncoming})`);
  console.log(`[EffectiveStockout] Theoretical max days: ${theoreticalMaxDays}`);

  // Calculate timeline with extended period to ensure we find the stockout point
  // Use theoretical max + 60 days buffer to ensure we capture the stockout
  const extendedForecastDays = Math.max(theoreticalMaxDays + 60, 365);
  console.log(`[EffectiveStockout] Using extended forecast period: ${extendedForecastDays} days`);
  
  const timeline = calculateProjectedStockTimeline(currentStock, dailyConsumption, incomingStock, extendedForecastDays);
  
  // Find the first day when stock reaches zero
  const stockoutDay = timeline.findIndex(day => day.projected_stock <= 0);
  
  let result;
  if (stockoutDay === -1) {
    // If we still don't find a stockout point, use the theoretical calculation
    result = theoreticalMaxDays;
    console.log(`[EffectiveStockout] No stockout found in timeline, using theoretical calculation: ${result} days`);
  } else {
    result = stockoutDay;
    console.log(`[EffectiveStockout] Found stockout at day ${result}`);
  }
  
  // Additional verification logging
  if (incomingStock.length > 0) {
    console.log(`[EffectiveStockout] Verification: ${totalStock} total stock / ${dailyConsumption} daily = ~${theoreticalMaxDays} theoretical days`);
    
    if (Math.abs(result - theoreticalMaxDays) > 30) {
      console.warn(`[EffectiveStockout] WARNING: Large discrepancy between timeline result (${result}d) and theoretical calculation (${theoreticalMaxDays}d)`);
    }
  }
  
  console.log(`[EffectiveStockout] Final result: ${result} days until stockout`);
  return result;
};
