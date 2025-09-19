
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { InfoIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface DashboardInfoProps {
  salespersonCode: string;
  selectedSalespersonName: string;
}

export const DashboardInfo = ({ salespersonCode, selectedSalespersonName }: DashboardInfoProps) => {
  const { isAdmin, profile } = useAuthStore();
  
  return (
    <div className="flex items-center gap-2 mb-4">
      <InfoIcon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        Showing data for: 
        {isAdmin && salespersonCode === "all" ? (
          <Badge variant="outline" className="ml-2">All Users</Badge>
        ) : (
          <Badge variant="outline" className="ml-2">
            {isAdmin && salespersonCode !== "all" 
              ? `Salesperson: ${selectedSalespersonName || salespersonCode}` 
              : `Your Customers Only ${profile?.spp_code ? `(${profile.spp_code})` : ''}`}
          </Badge>
        )}
      </span>
    </div>
  );
};
