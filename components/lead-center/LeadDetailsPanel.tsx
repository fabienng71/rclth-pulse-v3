import React, { useState } from 'react';
import { Edit, FileText, Link2, Calendar, User, MapPin, DollarSign, Target, Clock, Building2, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadCenter } from '@/types/leadCenter';
import { LeadNotesSection } from './LeadNotesSection';
import { LeadSampleLinking } from './LeadSampleLinking';
import { LeadActivityLinking } from './LeadActivityLinking';
import { LeadEditForm } from './LeadEditForm';
import { AILeadIntelligence } from './AILeadIntelligence';
import { ProductInterestManager } from './ProductInterestManager';
import { getChannelInfo, getChannelBadgeColor, getCompatibilityColor, getSalesStageInfo } from '@/utils/channelMapping';

interface LeadDetailsPanelProps {
  lead: LeadCenter;
  updateLead: (updates: Partial<LeadCenter>) => Promise<void>;
}

export const LeadDetailsPanel: React.FC<LeadDetailsPanelProps> = ({ lead, updateLead }) => {
  const [isEditing, setIsEditing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Won': return 'bg-green-100 text-green-800 border-green-200';
      case 'Lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isEditing) {
    return (
      <LeadEditForm 
        lead={lead} 
        onCancel={() => setIsEditing(false)} 
        onSuccess={() => setIsEditing(false)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Lead Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lead Details
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{lead.lead_title}</h3>
                <p className="text-muted-foreground text-sm">
                  {lead.lead_description || 'No description provided'}
                </p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                <Badge className={getPriorityColor(lead.priority)}>{lead.priority}</Badge>
                
                {/* Channel Intelligence */}
                {lead.customer_channel && (
                  <Badge 
                    variant="outline" 
                    className={`${getChannelBadgeColor(getChannelInfo(lead.customer_channel)?.category || 'other')}`}
                  >
                    <Building2 className="h-3 w-3 mr-1" />
                    {getChannelInfo(lead.customer_channel)?.name || lead.customer_channel}
                  </Badge>
                )}
                
                {/* Sales Stage */}
                {lead.sales_stage && (
                  <Badge 
                    variant="outline" 
                    className={getSalesStageInfo(lead.sales_stage).color}
                  >
                    {getSalesStageInfo(lead.sales_stage).label}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {lead.estimated_value && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    ฿{lead.estimated_value.toLocaleString()}
                  </span>
                </div>
              )}

              {lead.close_probability && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.close_probability}% probability</span>
                </div>
              )}

              {lead.lead_source && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.lead_source}</span>
                </div>
              )}

              {/* Channel Compatibility Score */}
              {lead.channel_compatibility_score && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Compatibility: {lead.channel_compatibility_score}/100
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {/* Customer Information */}
              {lead.customer && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{lead.customer.customer_name}</span>
                    <span className="text-xs text-muted-foreground">Customer: {lead.customer.customer_code}</span>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {lead.contact && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm">{lead.contact.first_name} {lead.contact.last_name}</span>
                    {lead.contact.email && (
                      <span className="text-xs text-muted-foreground">{lead.contact.email}</span>
                    )}
                  </div>
                </div>
              )}

              {lead.assigned_to && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Assigned</span>
                </div>
              )}

              {lead.next_step_due && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Due: {new Date(lead.next_step_due).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Created: {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Products */}
          {lead.recommended_products && lead.recommended_products.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Recommended Products for {getChannelInfo(lead.customer_channel || '')?.name || 'Channel'}:
              </h4>
              <div className="flex flex-wrap gap-2">
                {lead.recommended_products.map((product, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {product}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {lead.next_step && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm mb-1">Next Step:</h4>
                {lead.next_step_due && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Due: {new Date(lead.next_step_due).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="next_step_completed"
                  checked={lead.next_step_completed}
                  onCheckedChange={(checked) => {
                    updateLead({ next_step_completed: !!checked });
                  }}
                  className="mt-1"
                />
                <label
                  htmlFor="next_step_completed"
                  className={`text-sm text-muted-foreground ${
                    lead.next_step_completed ? 'line-through' : ''
                  }`}
                >
                  {lead.next_step}
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Lead Intelligence */}
      <AILeadIntelligence lead={lead} />

      {/* Tabs for Notes, Samples, Activities, and Product Interests */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notes & Timeline
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Product Interests
          </TabsTrigger>
          <TabsTrigger value="samples" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Linked Samples
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Linked Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <LeadNotesSection leadId={lead.id} />
        </TabsContent>

        <TabsContent value="products">
          <ProductInterestManager lead={lead} />
        </TabsContent>

        <TabsContent value="samples">
          <LeadSampleLinking 
            leadId={lead.id} 
            leadData={{
              customer_channel: lead.customer_channel,
              sales_stage: lead.sales_stage,
              channel_compatibility_score: lead.channel_compatibility_score,
              recommended_products: lead.recommended_products
            }}
          />
        </TabsContent>

        <TabsContent value="activities">
          <LeadActivityLinking 
            leadId={lead.id} 
            leadData={{
              customer_channel: lead.customer_channel,
              sales_stage: lead.sales_stage,
              channel_compatibility_score: lead.channel_compatibility_score
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};