import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export const usePagination = <T>(
  data: T[],
  options: UsePaginationOptions = {}
) => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Ensure current page is within valid range
  const validCurrentPage = useMemo(() => {
    return Math.max(1, Math.min(currentPage, totalPages || 1));
  }, [currentPage, totalPages]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, validCurrentPage, pageSize]);

  // Navigation functions
  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(validCurrentPage + 1);
  const goToPreviousPage = () => goToPage(validCurrentPage - 1);

  const changePageSize = (newPageSize: number) => {
    const currentIndex = (validCurrentPage - 1) * pageSize;
    const newPage = Math.floor(currentIndex / newPageSize) + 1;
    setPageSize(newPageSize);
    setCurrentPage(newPage);
  };

  // Generate page numbers for pagination controls
  const pageNumbers = useMemo(() => {
    const delta = 2; // Number of pages to show around current page
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= validCurrentPage - delta && i <= validCurrentPage + delta)
      ) {
        range.push(i);
      }
    }

    let prev = 0;
    for (const i of range) {
      if (prev + 1 !== i) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  }, [validCurrentPage, totalPages]);

  // State flags
  const canGoToPrevious = validCurrentPage > 1;
  const canGoToNext = validCurrentPage < totalPages;
  const isFirstPage = validCurrentPage === 1;
  const isLastPage = validCurrentPage === totalPages;

  // Stats
  const startIndex = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(validCurrentPage * pageSize, totalItems);

  return {
    // Data
    paginatedData,
    
    // Current state
    currentPage: validCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    
    // Navigation
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    
    // State flags
    canGoToPrevious,
    canGoToNext,
    isFirstPage,
    isLastPage,
    
    // Helpers
    pageNumbers,
    pageSizeOptions,
    startIndex,
    endIndex,
  };
};