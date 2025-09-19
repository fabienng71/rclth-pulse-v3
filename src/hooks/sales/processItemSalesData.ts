
import { CogsItem, MonthlyItemData, SalesDataItem } from "@/types/sales";

/**
 * Process raw sales data into a structured monthly format
 * Optimized to handle larger datasets
 */
export function processItemSalesData(
  salesData: SalesDataItem[],
  cogsMap: Map<string, number>
): MonthlyItemData[] {
  // Process data to group by item and month
  const processedData: MonthlyItemData[] = [];
  
  // Group data by item code
  const itemGroups: Record<string, SalesDataItem[]> = {};
  
  // Log the date range of the data we're processing
  if (salesData.length > 0) {
    const dates = salesData.map(item => new Date(item.posting_date || '').toISOString());
    const minDate = new Date(Math.min(...dates.map(d => new Date(d).getTime()))).toISOString();
    const maxDate = new Date(Math.max(...dates.map(d => new Date(d).getTime()))).toISOString();
    console.log(`Processing sales data from ${minDate} to ${maxDate}`);
  }
  
  // First pass: group by item code for more efficient processing
  salesData.forEach(item => {
    if (item.item_code) {
      if (!itemGroups[item.item_code]) {
        itemGroups[item.item_code] = [];
      }
      itemGroups[item.item_code].push(item);
    }
  });
  
  // Process each item group
  for (const [itemCode, items] of Object.entries(itemGroups)) {
    if (items.length === 0) continue;
    
    const itemData: MonthlyItemData = {
      item_code: itemCode,
      description: items[0].description,
      base_unit_code: items[0].base_unit_code,
      month_data: {},
      totals: {
        quantity: 0,
        amount: 0,
        margin: 0
      }
    };

    // Get COGS unit for this item
    const cogsUnit = cogsMap.get(itemCode);
    let totalItemMargin = 0;
    
    // Group by month and sum quantities and amounts
    items.forEach(item => {
      if (!item.posting_date) return;
      
      const date = new Date(item.posting_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!itemData.month_data[monthKey]) {
        itemData.month_data[monthKey] = { quantity: 0, amount: 0, margin: 0 };
      }
      
      const quantity = Number(item.quantity || 0);
      const amount = Number(item.amount || 0);
      
      itemData.month_data[monthKey].quantity += quantity;
      itemData.month_data[monthKey].amount += amount;
      
      // Calculate margin if we have COGS data
      if (cogsUnit) {
        const cost = quantity * cogsUnit;
        const margin = amount - cost;
        
        // Add margin to monthly data
        if (!itemData.month_data[monthKey].margin) {
          itemData.month_data[monthKey].margin = 0;
        }
        itemData.month_data[monthKey].margin += margin;
        
        // Track total margin
        totalItemMargin += margin;
      }
      
      // Add to totals
      itemData.totals.quantity += quantity;
      itemData.totals.amount += amount;
    });
    
    // Set total margin
    itemData.totals.margin = totalItemMargin;
    
    processedData.push(itemData);
  }
  
  // Log the number of months found in the processed data
  if (processedData.length > 0) {
    const allMonths = new Set<string>();
    processedData.forEach(item => {
      Object.keys(item.month_data).forEach(month => {
        allMonths.add(month);
      });
    });
    console.log(`Found data for ${allMonths.size} months: ${Array.from(allMonths).sort().join(', ')}`);
  }
  
  return processedData;
}
