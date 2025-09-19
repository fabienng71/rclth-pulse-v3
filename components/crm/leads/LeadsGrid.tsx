
import React from 'react';
import { LeadCard } from './LeadCard';

interface Lead {
  id: string;
  customer_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  updated_at: string | null;
  full_name: string | null;
}

interface LeadsGridProps {
  leads: Lead[];
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const LeadsGrid = ({ leads, onDelete }: LeadsGridProps) => {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-muted-foreground mb-4">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-full w-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No leads found</h3>
        <p className="text-sm text-muted-foreground">
          Get started by creating your first lead or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
