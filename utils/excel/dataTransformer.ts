
import { parseExcelDate } from './dateParser';
import { CREDIT_MEMO_HEADER_MAPPING, COGS_HEADER_MAPPING } from './headerMappings';

/**
 * Transform Excel data rows to match database schema
 */
export const transformExcelData = (rawData: any[], headerMapping: Record<string, string>): any[] => {
  console.log('Raw data sample:', rawData.slice(0, 2));
  console.log('Header mapping:', headerMapping);
  
  return rawData.map((row, index) => {
    const transformedRow: Record<string, any> = {};
    
    // Map Excel headers to database column names
    for (const [excelHeader, dbColumn] of Object.entries(headerMapping)) {
      if (row[excelHeader] !== undefined) {
        transformedRow[dbColumn] = row[excelHeader];
      }
    }
    
    console.log(`Processing row ${index + 1}:`, transformedRow);
    
    // Handle date fields with improved parsing (now preserves original dates)
    const dateFields = ['posting_date', 'due_date', 'tax_invoice_date'];
    dateFields.forEach(dateField => {
      if (transformedRow[dateField] !== undefined && transformedRow[dateField] !== null) {
        const originalValue = transformedRow[dateField];
        const parsedDate = parseExcelDate(originalValue, dateField);
        
        if (parsedDate) {
          // Store as date-only string to preserve the exact date without timezone conversion
          transformedRow[dateField] = parsedDate;
          console.log(`Row ${index + 1} - ${dateField}: ${originalValue} -> ${parsedDate}`);
        } else {
          console.warn(`Row ${index + 1} - Failed to parse ${dateField}: ${originalValue}`);
          // For required fields like posting_date, provide a fallback
          if (dateField === 'posting_date') {
            const today = new Date();
            const fallbackDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T00:00:00.000Z`;
            transformedRow[dateField] = fallbackDate;
            console.warn(`Row ${index + 1} - Using current date as fallback for posting_date: ${fallbackDate}`);
          }
        }
      }
    });
    
    // Convert numeric values - include COGS-specific fields
    const numericFields = headerMapping === COGS_HEADER_MAPPING ? 
      ['unit_cost', 'unit_price', 'profit', 'inventory', 'purchase_lcy', 'purchase_qty', 'cogs_lcy', 'sales_lcy', 'sales_qty'] :
      ['quantity', 'unit_cost', 'unit_price', 'amount', 'line_discount', 'line_discount_amount', 'amount_including_vat', 'remaining_amount', 'no_printed'];
    
    numericFields.forEach(field => {
      if (transformedRow[field] !== undefined) {
        // Handle fields that might be strings with commas or currency symbols
        if (typeof transformedRow[field] === 'string') {
          // Remove any non-numeric characters except decimal point
          const numericValue = transformedRow[field]
            .replace(/[^\d.-]/g, ''); // Remove everything except digits, decimal point, and negative sign
          transformedRow[field] = Number(numericValue);
        } else {
          transformedRow[field] = Number(transformedRow[field]);
        }
      }
    });
    
    // Convert boolean fields
    ['paid', 'cancelled', 'corrective', 'posted_tax_document', 'printed_tax_document', 'tax_document_marked'].forEach(field => {
      if (transformedRow[field] !== undefined) {
        // Convert 'Yes'/'No' strings to boolean
        if (typeof transformedRow[field] === 'string') {
          transformedRow[field] = 
            transformedRow[field].toLowerCase() === 'yes' || 
            transformedRow[field].toLowerCase() === 'true' ||
            transformedRow[field].toLowerCase() === 'x';
        }
      }
    });

    // Final validation for posting_date (required field)
    if (headerMapping === CREDIT_MEMO_HEADER_MAPPING && !transformedRow.posting_date) {
      // If due_date exists, use it as fallback for posting_date
      if (transformedRow.due_date) {
        transformedRow.posting_date = transformedRow.due_date;
        console.log(`Row ${index + 1} - Using due_date as posting_date fallback`);
      } else {
        // Default to current date if no date is available
        const today = new Date();
        const fallbackDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T00:00:00.000Z`;
        transformedRow.posting_date = fallbackDate;
        console.log(`Row ${index + 1} - Using current date as posting_date fallback: ${fallbackDate}`);
      }
    }
    
    console.log(`Row ${index + 1} final result:`, transformedRow);
    return transformedRow;
  });
};
