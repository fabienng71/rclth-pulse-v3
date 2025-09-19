
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReturnRequestFilterProps {
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
}

const ReturnRequestFilter = ({ nameFilter, onNameFilterChange }: ReturnRequestFilterProps) => {
  return (
    <div className="mb-4">
      <Label htmlFor="nameFilter">Filter by creator name</Label>
      <Input
        id="nameFilter"
        type="text"
        value={nameFilter}
        onChange={(e) => onNameFilterChange(e.target.value)}
        placeholder="Filter by name..."
        className="max-w-sm"
      />
    </div>
  );
};

export default ReturnRequestFilter;
