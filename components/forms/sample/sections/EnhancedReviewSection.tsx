
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { User, Package, Calendar, FileText, Edit2, Building, Clock } from 'lucide-react';
import { SampleRequestFormData } from '@/services/sampleRequestService';
import { format } from 'date-fns';

interface EnhancedReviewSectionProps {
  formData: SampleRequestFormData;
  onEdit: (step: 'customer' | 'items' | 'details') => void;
}

const EnhancedReviewSection = ({ formData, onEdit }: EnhancedReviewSectionProps) => {
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      if (item.price && !item.is_free) {
        return total + (item.price * item.quantity);
      }
      return total;
    }, 0);
  };
  
  const freeItemsCount = formData.items.filter(item => item.is_free).length;
  const paidItemsCount = formData.items.length - freeItemsCount;
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Review & Submit
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Please review all information before submitting your sample request
        </p>
      </div>
      
      {/* Customer Information */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              <User className="h-4 w-4 mr-2" />
              Customer Information
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit('customer')}
              className="text-primary hover:text-primary"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-lg">{formData.customerCode}</h4>
              <p className="text-muted-foreground">{formData.customerName}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Items Summary */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Sample Items ({formData.items.length})
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit('items')}
              className="text-primary hover:text-primary"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{formData.items.length}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{freeItemsCount}</div>
              <div className="text-sm text-muted-foreground">Free Items</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">฿{calculateTotal().toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.item_code}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {item.is_free ? (
                        <Badge variant="secondary" className="text-xs">Free</Badge>
                      ) : item.price ? (
                        `฿${item.price.toFixed(2)}`
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.is_free ? (
                        <Badge variant="secondary" className="text-xs">Free</Badge>
                      ) : item.price ? (
                        `฿${(item.price * item.quantity).toFixed(2)}`
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Additional Details */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Additional Details
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit('details')}
              className="text-primary hover:text-primary"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Follow-up Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Follow-up Date:</span>
            </div>
            <div>
              {formData.followUpDate ? (
                <Badge variant="outline">
                  {format(formData.followUpDate, 'MMM dd, yyyy')}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Not set</span>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Notes */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Notes:</span>
            </div>
            {formData.notes ? (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{formData.notes}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No additional notes</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Submission Notice */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h4 className="font-medium text-primary mb-2">Ready to Submit</h4>
        <p className="text-sm text-muted-foreground">
          By submitting this request, you confirm that all information is accurate. 
          You'll receive a confirmation email and can track the progress of your request.
        </p>
      </div>
    </div>
  );
};

export default EnhancedReviewSection;
