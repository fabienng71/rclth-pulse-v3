
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, User, Package, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ReturnRequestFormData } from '../EnhancedReturnForm';

interface EnhancedReturnReviewSectionProps {
  formData: ReturnRequestFormData;
  onEdit: (step: 'customer' | 'items' | 'details') => void;
}

const RETURN_REASONS = {
  'defective': 'Defective Product',
  'wrong_item': 'Wrong Item Shipped',
  'damaged': 'Damaged in Transit',
  'not_as_described': 'Not as Described',
  'quality_issue': 'Quality Issue',
  'overstock': 'Customer Overstock',
  'other': 'Other'
};

const PRIORITY_COLORS = {
  'low': 'bg-green-100 text-green-700 border-green-200',
  'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'high': 'bg-red-100 text-red-700 border-red-200'
};

const EnhancedReturnReviewSection = ({
  formData,
  onEdit
}: EnhancedReturnReviewSectionProps) => {
  const totalItems = formData.items.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Review Return Request
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Please review all details before submitting your return request
        </p>
      </div>
      
      {/* Customer Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              <User className="h-4 w-4 mr-2" />
              Customer Information
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit('customer')}
              className="h-8"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{formData.customerCode}</Badge>
              <span className="font-medium">{formData.customerName}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Items */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Return Items ({formData.items.length} items, {totalItems} total qty)
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit('items')}
              className="h-8"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className="text-xs">{item.item_code}</Badge>
                    {item.unit && <Badge variant="secondary" className="text-xs">{item.unit}</Badge>}
                    <Badge variant="outline" className="text-xs">Qty: {item.quantity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reason: {RETURN_REASONS[item.reason as keyof typeof RETURN_REASONS] || item.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Return Details */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Return Details
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit('details')}
              className="h-8"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Return Date</Label>
                <p className="text-sm text-muted-foreground">
                  {format(formData.returnDate, "PPP")}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <div className="mt-1">
                  <Badge className={`${PRIORITY_COLORS[formData.priority]} text-xs`}>
                    {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
            
            {formData.notes && (
              <div>
                <Label className="text-sm font-medium">Additional Notes</Label>
                <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted/50 rounded-lg">
                  {formData.notes}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="font-semibold text-primary mb-2">Ready to Submit</h4>
            <p className="text-sm text-muted-foreground">
              Your return request for {formData.items.length} item(s) is ready to be submitted.
              You will receive a confirmation email once it's processed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Label = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);

export default EnhancedReturnReviewSection;
