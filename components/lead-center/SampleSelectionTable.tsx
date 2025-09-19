import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, X, Search, Calendar, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

interface SampleRequest {
  id: string;
  customer_name: string;
  created_at: string;
  notes: string | null;
}

interface SampleSelectionTableProps {
  linkedSampleIds: string[];
  onLinkSamples: (sampleIds: string[]) => void;
  onClose: () => void;
}

export const SampleSelectionTable: React.FC<SampleSelectionTableProps> = ({
  linkedSampleIds,
  onLinkSamples,
  onClose,
}) => {
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: sampleRequests, isLoading } = useQuery({
    queryKey: ['available-sample-requests', debouncedSearchTerm],
    queryFn: async () => {
      const { data: linkedIdsData, error: linkedIdsError } = await supabase
        .from('lead_sample_links')
        .select('sample_id');

      if (linkedIdsError) {
        console.error('Error fetching linked sample IDs:', linkedIdsError);
        throw linkedIdsError;
      }
      
      const alreadyLinkedIds = linkedIdsData.map(link => link.sample_id);

      let query = supabase
        .from('sample_requests')
        .select('id, customer_name, created_at, notes');

      if (alreadyLinkedIds.length > 0) {
        query = query.not('id', 'in', `(${alreadyLinkedIds.join(',')})`);
      }

      if (debouncedSearchTerm) {
        query = query.ilike('customer_name', `%${debouncedSearchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sample requests:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  const handleSampleToggle = (sampleId: string) => {
    setSelectedSamples(prev =>
      prev.includes(sampleId)
        ? prev.filter(id => id !== sampleId)
        : [...prev, sampleId]
    );
  };

  const handleLinkSelected = () => {
    if (selectedSamples.length > 0) {
      onLinkSamples(selectedSamples);
      setSelectedSamples([]);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Link Sample Requests to Lead</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-grow overflow-hidden flex flex-col space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground flex-grow flex flex-col items-center justify-center">
              Loading available sample requests...
            </div>
          ) : !sampleRequests || sampleRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground flex-grow flex flex-col items-center justify-center">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No available sample requests match your search</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Select samples to link ({selectedSamples.length} selected)
                </p>
                <Button
                  onClick={handleLinkSelected}
                  disabled={selectedSamples.length === 0}
                >
                  Link Selected ({selectedSamples.length})
                </Button>
              </div>

              <div className="space-y-2 flex-grow overflow-y-auto">
                {sampleRequests.map((sample) => (
                  <div
                    key={sample.id}
                    className="flex items-start space-x-3 p-3 border rounded-md hover:bg-muted/50"
                  >
                    <Checkbox
                      className="mt-1"
                      checked={selectedSamples.includes(sample.id)}
                      onCheckedChange={() => handleSampleToggle(sample.id)}
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold">
                          <User className="h-3 w-3" />
                          {sample.customer_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(sample.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {sample.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {sample.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
