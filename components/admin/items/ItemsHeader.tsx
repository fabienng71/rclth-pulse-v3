
import React from 'react';
import { Package, Plus, Search, Upload, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ItemsHeaderProps {
  onCreateClick: () => void;
  onUploadClick: () => void;
  onSyncClick: () => void;
}

export const ItemsHeader = ({ onCreateClick, onUploadClick, onSyncClick }: ItemsHeaderProps) => {
  const handleCreateClick = () => {
    onCreateClick();
  };

  const handleUploadClick = () => {
    onUploadClick();
  };

  const handleSyncClick = () => {
    onSyncClick();
  };

  return (
    <div className="section-background p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500 text-white">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Items Management
            </h1>
            <p className="text-muted-foreground text-xl mt-2">
              Manage inventory items, pricing, and product information
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSyncClick} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Sync to Stock
          </Button>
          <Button 
            onClick={handleUploadClick} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Items
          </Button>
          <Button onClick={handleCreateClick} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ItemsSearchBar = ({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (value: string) => void }) => (
  <div className="flex items-center gap-2">
    <Search className="h-4 w-4" />
    <Input
      placeholder="Search items..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-64"
    />
  </div>
);
