import React, { useState } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadCenterStats } from '@/components/lead-center/LeadCenterStats';

import { LeadCenterTable } from '@/components/lead-center/LeadCenterTable';
import { KanbanBoard } from '@/components/lead-center/KanbanBoard';
import { ChannelIntelligenceDashboard } from '@/components/lead-center/ChannelIntelligenceDashboard';
import { useLeadCenter } from '@/hooks/useLeadCenter';
import { LeadCenterFilters as FiltersType } from '@/types/leadCenter';

const LeadCenterDashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FiltersType>({});
  const [view, setView] = useState<'list' | 'kanban' | 'intelligence'>('list');

  const { leads, stats, isLoading, updateLeadStatus, deleteLead, refetch } = useLeadCenter(filters);

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <>
      <Navigation />
      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Lead Center</h1>
            <p className="text-muted-foreground">
              Centralized pipeline management for all your leads
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border">
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('kanban')}
                className="rounded-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'intelligence' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('intelligence')}
                className="rounded-l-none"
              >
                📊
              </Button>
            </div>
            <Button onClick={() => navigate('/crm/lead-center/create')}>
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <LeadCenterStats stats={stats} isLoading={isLoading} />
        </div>

        {/* Main Content */}
        <div className="w-full">
          {/* Content Area */}
          <div className="w-full">
            <Tabs value={view} onValueChange={(value) => setView(value as 'list' | 'kanban' | 'intelligence')}>
              <TabsContent value="list">
                <LeadCenterTable
                  leads={leads}
                  isLoading={isLoading}
                  onStatusUpdate={updateLeadStatus}
                  onDelete={deleteLead}
                />
              </TabsContent>
              
              <TabsContent value="kanban">
                <KanbanBoard
                  leads={leads}
                  isLoading={isLoading}
                  onStatusUpdate={updateLeadStatus}
                  onDelete={deleteLead}
                />
              </TabsContent>
              
              <TabsContent value="intelligence">
                <ChannelIntelligenceDashboard 
                  leads={leads}
                  onRefresh={refetch}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadCenterDashboard;