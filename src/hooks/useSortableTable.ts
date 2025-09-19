
import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export function useSortableTable<T extends string>(
  defaultSortField: T, 
  defaultSortDirection: SortDirection = 'desc'
) {
  const [sortField, setSortField] = useState<T | null>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  
  const handleSort = (field: T) => {
    if (sortField === field) {
      // Cycle through: desc -> asc -> none -> desc
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('desc');
      }
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortData = <DataType extends Record<string, any>>(data: DataType[]): DataType[] => {
    if (!sortField || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string values (case insensitive)
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (aString < bString) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aString > bString) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  return { 
    sortField, 
    sortDirection, 
    handleSort,
    sortData
  };
}
