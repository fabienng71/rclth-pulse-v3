
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useProfilesList } from '@/hooks/useProfilesList';

interface SalespersonFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const SalespersonFilter: React.FC<SalespersonFilterProps> = ({
  value,
  onChange,
}) => {
  const { data: profiles, isLoading } = useProfilesList();

  // Since useProfilesList already filters for valid spp_codes, we can use all profiles
  // No need to filter by role since having a spp_code effectively makes them a salesperson
  const salespeople = profiles || [];

  if (isLoading) {
    return (
      <div className="flex gap-2 items-center">
        <Label htmlFor="salesperson-filter" className="text-sm font-medium whitespace-nowrap">
          Salesperson:
        </Label>
        <Select disabled>
          <SelectTrigger id="salesperson-filter" className="w-[180px]">
            <SelectValue placeholder="Loading..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <Label htmlFor="salesperson-filter" className="text-sm font-medium whitespace-nowrap">
        Salesperson:
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="salesperson-filter" className="w-[180px]">
          <SelectValue placeholder="All Salespeople" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Salespeople</SelectItem>
          {salespeople.map((profile) => (
            <SelectItem key={profile.id} value={profile.spp_code!}>
              {profile.full_name || profile.email} ({profile.spp_code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
