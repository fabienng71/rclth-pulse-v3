
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TopNSelectorProps } from './types';

export const TopNSelector = ({ value, onChange, options = [10, 20, 30, 50, 100, 200, 500, -1] }: TopNSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm whitespace-nowrap">Show top:</span>
      <Select
        value={value === -1 ? "all" : value.toString()}
        onValueChange={(val) => onChange(val === "all" ? -1 : Number(val))}
      >
        <SelectTrigger className="w-[80px] h-9">
          <SelectValue placeholder={value === -1 ? "ALL" : value.toString()} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option === -1 ? "all" : option.toString()}>
              {option === -1 ? "ALL" : option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
