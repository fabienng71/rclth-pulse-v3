
import { useState, useEffect } from 'react';
import { getCurrentWeekNumber, getMaxWeekNumber } from '@/utils/weekUtils';

export const useWeekData = () => {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [currentYear] = useState<number>(new Date().getFullYear());
  const [maxWeek, setMaxWeek] = useState<number>(52);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWeekData = async () => {
      try {
        setIsLoading(true);
        const [currentWeekNum, maxWeekNum] = await Promise.all([
          getCurrentWeekNumber(),
          getMaxWeekNumber(currentYear)
        ]);
        
        setCurrentWeek(currentWeekNum);
        setMaxWeek(maxWeekNum);
      } catch (error) {
        console.error('Error loading week data:', error);
        // Use fallback values
        setCurrentWeek(1);
        setMaxWeek(52);
      } finally {
        setIsLoading(false);
      }
    };

    loadWeekData();
  }, [currentYear]);

  return {
    currentWeek,
    currentYear,
    maxWeek,
    isLoading
  };
};
