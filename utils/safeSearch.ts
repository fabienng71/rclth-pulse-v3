// Enhanced safe search utilities with comprehensive error handling and null safety

export const safeIncludes = (value: string | null | undefined, searchTerm: string | null | undefined): boolean => {
  // Return false immediately if either value is falsy
  if (!value || !searchTerm) return false;
  
  try {
    // Ensure both values are strings and perform case-insensitive search
    const normalizedValue = String(value).toLowerCase().trim();
    const normalizedSearchTerm = String(searchTerm).toLowerCase().trim();
    
    // Handle empty strings after trimming
    if (!normalizedValue || !normalizedSearchTerm) return false;
    
    return normalizedValue.includes(normalizedSearchTerm);
  } catch (error) {
    console.warn('safeIncludes error:', error, 'value:', value, 'searchTerm:', searchTerm);
    return false;
  }
};

export const safeToLowerCase = (value: string | null | undefined): string => {
  if (value === null || value === undefined) return '';
  
  try {
    return String(value).toLowerCase().trim();
  } catch (error) {
    console.warn('safeToLowerCase error:', error, 'value:', value);
    return '';
  }
};

export const safeStringValue = (value: string | null | undefined, fallback: string = ''): string => {
  if (value === null || value === undefined) return fallback;
  
  try {
    const result = String(value).trim();
    return result || fallback;
  } catch (error) {
    console.warn('safeStringValue error:', error, 'value:', value);
    return fallback;
  }
};

// Enhanced search for multiple fields
export const safeMultiFieldSearch = (
  fields: (string | null | undefined)[], 
  searchTerm: string | null | undefined
): boolean => {
  if (!searchTerm || fields.length === 0) return false;
  
  try {
    const normalizedSearchTerm = String(searchTerm).toLowerCase().trim();
    if (!normalizedSearchTerm) return false;
    
    return fields.some(field => safeIncludes(field, normalizedSearchTerm));
  } catch (error) {
    console.warn('safeMultiFieldSearch error:', error, 'fields:', fields, 'searchTerm:', searchTerm);
    return false;
  }
};

// Safe numeric value extraction from strings
export const safeParseNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  
  try {
    if (typeof value === 'number') {
      return isNaN(value) || !isFinite(value) ? 0 : value;
    }
    
    const parsed = parseFloat(String(value));
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  } catch (error) {
    console.warn('safeParseNumber error:', error, 'value:', value);
    return 0;
  }
};

// Safe array filtering with search
export const safeFilterArray = <T>(
  array: T[], 
  searchTerm: string | null | undefined,
  extractFields: (item: T) => (string | null | undefined)[]
): T[] => {
  if (!Array.isArray(array)) return [];
  if (!searchTerm) return array;
  
  try {
    return array.filter(item => {
      try {
        const fields = extractFields(item);
        return safeMultiFieldSearch(fields, searchTerm);
      } catch (error) {
        console.warn('safeFilterArray item error:', error, 'item:', item);
        return false;
      }
    });
  } catch (error) {
    console.warn('safeFilterArray error:', error, 'array length:', array?.length);
    return array;
  }
};