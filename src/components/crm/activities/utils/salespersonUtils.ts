
// A cache to consistently assign the same color to the same salesperson
const salespersonColorCache: Record<string, string> = {};

// Available colors that match pipeline stage badge styling (100 background with 700 text)
const colors = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200', 
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-sky-100 text-sky-700 border-sky-200',
  'bg-red-100 text-red-700 border-red-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-teal-100 text-teal-700 border-teal-200'
];

/**
 * Returns a consistent color for a salesperson name that matches pipeline stage badge styling
 * @param salespersonName The name of the salesperson
 * @returns A CSS class string for the badge styling
 */
export const getSalespersonColor = (salespersonName: string): string => {
  // If this salesperson already has an assigned color, return it
  if (salespersonColorCache[salespersonName]) {
    return salespersonColorCache[salespersonName];
  }
  
  // Assign a new color based on the number of existing assignments
  const colorIndex = Object.keys(salespersonColorCache).length % colors.length;
  const assignedColor = colors[colorIndex];
  
  // Cache this assignment for future use
  salespersonColorCache[salespersonName] = assignedColor;
  
  return assignedColor;
};
