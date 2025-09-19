import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SyncHealthIndicator, SyncStatsDisplay, CogsSyncTab, CogsImportTab } from './cogs';

// ============================================================================
// COGS Management Component
// ============================================================================
// Admin interface for managing COGS synchronization and data
// ============================================================================

export const CogsManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">COGS Data Management</h2>
        <p className="text-muted-foreground">
          Monitor and manage Cost of Goods Sold data synchronization between tables.
        </p>
      </div>

      {/* Health Status */}
      <SyncHealthIndicator />

      {/* Statistics Overview */}
      <SyncStatsDisplay />

      {/* Main Content Tabs */}
      <Tabs defaultValue="sync" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
          <TabsTrigger value="import">Data Import</TabsTrigger>
        </TabsList>

        <TabsContent value="sync">
          <CogsSyncTab />
        </TabsContent>

        <TabsContent value="import">
          <CogsImportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};