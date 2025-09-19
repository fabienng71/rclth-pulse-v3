
import React from 'react';
import { format } from 'date-fns';
import { Package, Calendar, FileText, ShoppingCart, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SampleRequest {
  id: string;
  customer_name: string;
  customer_code: string;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
  items?: Array<{
    item_code: string;
    description: string;
    quantity: number;
    is_free: boolean;
    price: number | null;
  }>;
}

interface LinkedSampleDetailsProps {
  sampleRequest: SampleRequest;
}

export const LinkedSampleDetails: React.FC<LinkedSampleDetailsProps> = ({ sampleRequest }) => {
  return (
    <div className="border rounded-lg p-4 bg-blue-50/50">
      <div className="flex items-center gap-2 mb-3">
        <Package className="h-4 w-4 text-blue-600" />
        <h5 className="font-medium text-blue-900">Linked Sample Request</h5>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium">{sampleRequest.customer_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Customer Code:</span>
            <span className="font-mono text-xs">{sampleRequest.customer_code}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span>{format(new Date(sampleRequest.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {sampleRequest.follow_up_date && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Follow-up:
              </span>
              <span>{format(new Date(sampleRequest.follow_up_date), 'MMM dd, yyyy')}</span>
            </div>
          )}
          {sampleRequest.items && sampleRequest.items.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" />
                Items:
              </span>
              <span className="font-medium">{sampleRequest.items.length}</span>
            </div>
          )}
        </div>
      </div>

      {sampleRequest.items && sampleRequest.items.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <h6 className="text-xs font-medium text-muted-foreground mb-2">Sample Items:</h6>
          <div className="space-y-1">
            {sampleRequest.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs bg-white rounded p-2">
                <div className="flex-1">
                  <span className="font-mono text-muted-foreground">{item.item_code}</span>
                  <span className="ml-2">{item.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Qty: {item.quantity}</span>
                  {item.is_free ? (
                    <Badge variant="secondary" className="text-xs">Free</Badge>
                  ) : item.price && (
                    <span className="flex items-center gap-1 text-green-600">
                      <DollarSign className="h-3 w-3" />
                      {item.price}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {sampleRequest.items.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                +{sampleRequest.items.length - 3} more items
              </div>
            )}
          </div>
        </div>
      )}

      {sampleRequest.notes && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-1 mb-1">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Notes:</span>
          </div>
          <p className="text-xs text-muted-foreground">{sampleRequest.notes}</p>
        </div>
      )}
    </div>
  );
};
