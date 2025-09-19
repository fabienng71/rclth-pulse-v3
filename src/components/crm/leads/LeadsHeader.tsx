
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Download, Filter, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Lead } from '@/hooks/useOptimizedLeadsData';

interface LeadsHeaderProps {
  selectedLeads: Lead[];
}

export const LeadsHeader = ({ selectedLeads }: LeadsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Leads Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Track and manage your sales opportunities
              {selectedLeads.length > 0 && (
                <span className="ml-2 font-medium text-blue-700">
                  • {selectedLeads.length} selected
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {}}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => navigate('/crm/leads/create')}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => navigate('/crm/leads/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
