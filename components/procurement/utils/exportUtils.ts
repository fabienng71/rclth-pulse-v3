
import * as XLSX from 'xlsx';
import { ShipmentItem } from '@/hooks/useShipmentDetails';

/**
 * Export shipment items to Excel as a Purchase Order
 */
export const exportShipmentItemsToExcel = (items: ShipmentItem[], shipmentId: string) => {
  // Transform the items into the required format
  const excelData = items.map(item => ({
    item_code: item.item_code,
    '': '', // Blank column as requested
    description: item.description,
    quantity: item.quantity,
    base_unit_code: item.base_unit_code || 'PCS', // Use the actual base_unit_code from the item if available
    direct_unit_cost: item.direct_unit_cost || '' // Include direct_unit_cost
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Order');
  
  // Generate filename with shipment ID
  const fileName = `purchase-order-${shipmentId.substring(0, 8)}.xlsx`;
  
  // Export file
  XLSX.writeFile(workbook, fileName);
};
