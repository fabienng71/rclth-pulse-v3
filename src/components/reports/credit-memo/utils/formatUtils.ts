
// Format currency number without the THB symbol and decimals
export const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', { 
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(value);
};
