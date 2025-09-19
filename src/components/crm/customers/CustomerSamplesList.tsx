
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Package, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CleanFragment } from '@/components/ui/clean-fragment';

interface SampleRequest {
  id: string;
  customer_code: string;
  customer_name: string;
  salesperson_code: string;
  notes: string | null;
  created_at: string;
  follow_up_date: string | null;
  items: Array<{
    id: string;
    item_code: string;
    description: string;
    quantity: number;
    is_free: boolean;
    price: number | null;
  }>;
}

interface CustomerSamplesListProps {
  customerCode: string;
}

export const CustomerSamplesList: React.FC<CustomerSamplesListProps> = ({ customerCode }) => {
  const [expandedSamples, setExpandedSamples] = useState<Set<string>>(new Set());

  const { data: sampleRequests, isLoading } = useQuery({
    queryKey: ['customerSamples', customerCode],
    queryFn: async () => {
      const { data: samples, error } = await supabase
        .from('sample_requests')
        .select(`
          id,
          customer_code,
          customer_name,
          salesperson_code,
          notes,
          created_at,
          follow_up_date
        `)
        .eq('customer_code', customerCode)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch items for each sample request
      const samplesWithItems = await Promise.all(
        (samples || []).map(async (sample) => {
          const { data: items } = await supabase
            .from('sample_request_items')
            .select('id, item_code, description, quantity, is_free, price')
            .eq('request_id', sample.id);

          return {
            ...sample,
            items: items || []
          };
        })
      );

      return samplesWithItems as SampleRequest[];
    },
    enabled: !!customerCode
  });

  const toggleSample = (sampleId: string) => {
    const newExpanded = new Set(expandedSamples);
    if (newExpanded.has(sampleId)) {
      newExpanded.delete(sampleId);
    } else {
      newExpanded.add(sampleId);
    }
    setExpandedSamples(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">Loading samples...</div>
        </CardContent>
      </Card>
    );
  }

  if (!sampleRequests || sampleRequests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4 text-muted-foreground">
            No sample requests found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4" />
          Sample Requests ({sampleRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Salesperson</TableHead>
              <TableHead>Follow-up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleRequests.map((sample) => (
              <CleanFragment fragmentKey={sample.id}>
                <TableRow>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSample(sample.id)}
                    >
                      {expandedSamples.has(sample.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>{formatDate(sample.created_at)}</TableCell>
                  <TableCell>{sample.items.length} items</TableCell>
                  <TableCell>{sample.salesperson_code || '-'}</TableCell>
                  <TableCell>
                    {sample.follow_up_date ? formatDate(sample.follow_up_date) : '-'}
                  </TableCell>
                </TableRow>
                {expandedSamples.has(sample.id) && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <div className="bg-muted/30 p-4">
                        <div className="space-y-4">
                          {sample.notes && (
                            <div>
                              <h4 className="font-medium mb-2">Notes</h4>
                              <p className="text-sm text-muted-foreground">{sample.notes}</p>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium mb-2">Items</h4>
                            <div className="grid gap-2">
                              {sample.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-2 bg-background rounded border">
                                  <div>
                                    <span className="font-medium">{item.item_code}</span>
                                    {item.description && (
                                      <span className="text-sm text-muted-foreground ml-2">
                                        - {item.description}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm">Qty: {item.quantity}</div>
                                    {item.is_free ? (
                                      <div className="text-xs text-green-600">Free</div>
                                    ) : (
                                      <div className="text-xs">${item.price || 0}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </CleanFragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
