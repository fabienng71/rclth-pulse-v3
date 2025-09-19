import { useState, useCallback } from 'react';

export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    reset,
    setValue,
  };
};