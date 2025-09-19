import { 
  saveStockFilters, 
  loadStockFilters, 
  clearStockFilters, 
  DEFAULT_STOCK_FILTERS,
  isLocalStorageAvailable,
  getStorageInfo
} from '../stockFilterStorage';
import { StockFilters } from '@/hooks/useStockData';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('stockFilterStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Clear console spys
    jest.clearAllMocks();
  });

  describe('saveStockFilters', () => {
    it('should save filters to localStorage', () => {
      const testFilters: StockFilters = {
        hideZeroStock: true,
        showOnlyCriticalAndLow: false,
        showOnlyPricelist: true
      };

      saveStockFilters(testFilters);

      const storedData = localStorage.getItem('stock-on-hand-filters');
      expect(storedData).toBeTruthy();
      
      const parsedData = JSON.parse(storedData!);
      expect(parsedData.hideZeroStock).toBe(true);
      expect(parsedData.showOnlyCriticalAndLow).toBe(false);
      expect(parsedData.showOnlyPricelist).toBe(true);
      expect(parsedData.version).toBe(1);
      expect(typeof parsedData.timestamp).toBe('number');
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('localStorage error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const testFilters: StockFilters = {
        hideZeroStock: true,
        showOnlyCriticalAndLow: false,
        showOnlyPricelist: false
      };

      // Should not throw an error
      expect(() => saveStockFilters(testFilters)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      // Restore original function
      localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe('loadStockFilters', () => {
    it('should load filters from localStorage', () => {
      const testFilters: StockFilters = {
        hideZeroStock: true,
        showOnlyCriticalAndLow: true,
        showOnlyPricelist: false
      };

      // Save filters first
      saveStockFilters(testFilters);

      // Load filters
      const loadedFilters = loadStockFilters();

      expect(loadedFilters).toEqual(testFilters);
    });

    it('should return null when no data is stored', () => {
      const result = loadStockFilters();
      expect(result).toBeNull();
    });

    it('should handle corrupted data gracefully', () => {
      // Store invalid JSON
      localStorage.setItem('stock-on-hand-filters', 'invalid json');

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = loadStockFilters();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle invalid data structure', () => {
      // Store data with missing fields
      const invalidData = {
        hideZeroStock: true,
        // missing other required fields
      };
      localStorage.setItem('stock-on-hand-filters', JSON.stringify(invalidData));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = loadStockFilters();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('clearStockFilters', () => {
    it('should clear stored filters', () => {
      // Save some filters first
      saveStockFilters(DEFAULT_STOCK_FILTERS);
      expect(localStorage.getItem('stock-on-hand-filters')).toBeTruthy();

      // Clear filters
      clearStockFilters();
      expect(localStorage.getItem('stock-on-hand-filters')).toBeNull();
    });
  });

  describe('isLocalStorageAvailable', () => {
    it('should detect localStorage availability', () => {
      const result = isLocalStorageAvailable();
      expect(result).toBe(true);
    });

    it('should handle localStorage errors', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('localStorage error');
      });

      const result = isLocalStorageAvailable();
      expect(result).toBe(false);

      localStorage.setItem = originalSetItem;
    });
  });

  describe('getStorageInfo', () => {
    it('should return correct storage information', () => {
      const testFilters: StockFilters = {
        hideZeroStock: true,
        showOnlyCriticalAndLow: false,
        showOnlyPricelist: true
      };

      saveStockFilters(testFilters);

      const info = getStorageInfo();
      expect(info.isAvailable).toBe(true);
      expect(info.storageKey).toBe('stock-on-hand-filters');
      expect(info.currentVersion).toBe(1);
      expect(info.hasStoredData).toBe(true);
    });

    it('should handle no stored data', () => {
      const info = getStorageInfo();
      expect(info.hasStoredData).toBe(false);
    });
  });

  describe('default values', () => {
    it('should have correct default filter values', () => {
      expect(DEFAULT_STOCK_FILTERS).toEqual({
        hideZeroStock: false,
        showOnlyCriticalAndLow: false,
        showOnlyPricelist: false
      });
    });
  });
});