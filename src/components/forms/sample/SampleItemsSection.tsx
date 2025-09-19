
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SampleRequestItem } from '@/services/sampleRequestService';
import ItemSearch from './ItemSearch';
import ItemsTable from './ItemsTable';

interface SampleItemsSectionProps {
  items: SampleRequestItem[];
  isSubmitting: boolean;
  onAddItem: (item: SampleRequestItem) => void;
  onAddEmptyItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: keyof SampleRequestItem, value: any) => void;
}

const SampleItemsSection: React.FC<SampleItemsSectionProps> = ({
  items,
  isSubmitting,
  onAddItem,
  onAddEmptyItem,
  onRemoveItem,
  onUpdateItem
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sample Items</h2>
        <div className="flex gap-2">
          <ItemSearch 
            isSubmitting={isSubmitting} 
            onAddItem={onAddItem} 
          />
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onAddEmptyItem}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Custom Item
          </Button>
        </div>
      </div>
      
      <ItemsTable 
        items={items}
        isSubmitting={isSubmitting}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
      />
    </>
  );
};

export default SampleItemsSection;
