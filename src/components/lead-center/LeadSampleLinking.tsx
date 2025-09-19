
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package, User, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { SampleSelectionTable } from './SampleSelectionTable';
import { getChannelInfo } from '@/utils/channelMapping';

interface LinkedSample {
  id: string;
  sample_id: string;
  linked_at: string;
  sample: {
    id: string;
    sample_type: string;
    status: string;
    request_date: string;
    customer?: {
      customer_name: string;
    };
  };
}

interface LeadSampleLinkingProps {
  leadId: string;
  leadData?: {
    customer_channel?: string;
    sales_stage?: string;
    channel_compatibility_score?: number;
    recommended_products?: string[];
  };
}

export const LeadSampleLinking: React.FC<LeadSampleLinkingProps> = ({ leadId, leadData }) => {
  const [linkedSamples, setLinkedSamples] = useState<LinkedSample[]>([]);
  const [showSelectionTable, setShowSelectionTable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Helper function to get sample relevance based on channel and sales stage
  const getSampleRelevance = (sampleType: string, customerChannel?: string, salesStage?: string) => {
    if (!customerChannel || !salesStage) return null;
    
    const channelInfo = getChannelInfo(customerChannel);
    if (!channelInfo) return null;

    // High relevance if we're in samples stage and it's a matching product
    if (salesStage === 'samples_sent' || salesStage === 'samples_followed_up') {
      return { level: 'high' as const, reason: 'Perfect timing - currently in samples stage' };
    }

    // Medium relevance if we're in meeting stage (good time to discuss samples)
    if (salesStage === 'meeting_scheduled') {
      return { level: 'medium' as const, reason: 'Good timing - can discuss samples during meeting' };
    }

    // Check if sample matches recommended products
    if (leadData?.recommended_products?.some(product => 
      sampleType.toLowerCase().includes(product.toLowerCase()) || 
      product.toLowerCase().includes(sampleType.toLowerCase())
    )) {
      return { level: 'high' as const, reason: 'Matches recommended products for this channel' };
    }

    return { level: 'medium' as const, reason: 'Good for building relationship' };
  };

  const fetchLinkedSamples = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_sample_links')
        .select(`
          id,
          sample_id,
          created_at,
          sample_requests (
            id,
            customer_name,
            created_at,
            notes
          )
        `)
        .eq('lead_id', leadId);

      if (error) throw error;
      
      const formattedData = data?.map((link: any) => ({
        id: link.id,
        sample_id: link.sample_id,
        linked_at: link.created_at,
        sample: {
          id: link.sample_requests.id,
          customer_name: link.sample_requests.customer_name,
          request_date: link.sample_requests.created_at,
          notes: link.sample_requests.notes,
        }
      })) || [];

      setLinkedSamples(formattedData);
    } catch (error: any) {
      console.error('Error fetching linked samples:', error);
      toast({
        title: "Error",
        description: "Failed to load linked samples",
        variant: "destructive",
      });
    }
  };

  const linkSamples = async (sampleIds: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const linksToInsert = sampleIds.map(sampleId => ({
        lead_id: leadId,
        sample_id: sampleId,
        created_by: user.id,
      }));

      const { error } = await supabase
        .from('lead_sample_links')
        .insert(linksToInsert);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Warning",
            description: "Some samples are already linked to this lead.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: `${sampleIds.length} ${sampleIds.length === 1 ? 'sample' : 'samples'} linked successfully`,
      });

      fetchLinkedSamples();
    } catch (error: any) {
      console.error('Error linking samples:', error);
      toast({
        title: "Error",
        description: "Failed to link samples. Please try again.",
        variant: "destructive",
      });
    }
  };

  const unlinkSample = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('lead_sample_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sample unlinked successfully",
      });

      fetchLinkedSamples();
    } catch (error: any) {
      console.error('Error unlinking sample:', error);
      toast({
        title: "Error",
        description: "Failed to unlink sample",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLinkSamples = async (sampleIds: string[]) => {
    await linkSamples(sampleIds);
    setShowSelectionTable(false);
  };

  useEffect(() => {
    fetchLinkedSamples();
    setIsLoading(false);
  }, [leadId]);

  if (isLoading) {
    return <div className="animate-pulse">Loading samples...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Linked Samples ({linkedSamples.length})
            </CardTitle>
            <Button onClick={() => setShowSelectionTable(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Link Samples
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {linkedSamples.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No samples linked to this lead</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setShowSelectionTable(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Link Your First Sample
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {linkedSamples.map(linked => {
                const relevance = getSampleRelevance(
                  linked.sample.customer_name || '', 
                  leadData?.customer_channel, 
                  leadData?.sales_stage
                );
                return (
                  <div key={linked.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{linked.sample.customer_name}</h4>
                        {relevance && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              relevance.level === 'high' ? 'bg-green-100 text-green-800 border-green-200' :
                              relevance.level === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }`}
                          >
                            <Target className="h-3 w-3 mr-1" />
                            {relevance.level} relevance
                          </Badge>
                        )}
                      </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Requested: {new Date(linked.sample.request_date).toLocaleDateString()}</span>
                      <span>Linked: {new Date(linked.linked_at).toLocaleDateString()}</span>
                    </div>
                    {linked.sample.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {linked.sample.notes}
                      </p>
                    )}
                    {relevance && (
                      <div className="text-xs text-muted-foreground mt-1 italic">
                        💡 {relevance.reason}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => unlinkSample(linked.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showSelectionTable && (
        <SampleSelectionTable
          linkedSampleIds={linkedSamples.map(link => link.sample_id)}
          onLinkSamples={handleLinkSamples}
          onClose={() => setShowSelectionTable(false)}
        />
      )}
    </>
  );
};
