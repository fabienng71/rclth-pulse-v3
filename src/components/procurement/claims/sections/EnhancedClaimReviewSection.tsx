
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building, Package, AlertCircle, FileText, Edit, Save, Mail, Download, Loader2 } from 'lucide-react';
import { ClaimFormData } from '../EnhancedClaimForm';

interface EnhancedClaimReviewSectionProps {
  formData: ClaimFormData;
  onEdit: (step: 'vendor' | 'items' | 'details') => void;
  onSaveDraft: () => void;
  onSendEmail: () => void;
  onGeneratePdf: () => void;
  isSubmitting: boolean;
}

const EnhancedClaimReviewSection = ({
  formData,
  onEdit,
  onSaveDraft,
  onSendEmail,
  onGeneratePdf,
  isSubmitting
}: EnhancedClaimReviewSectionProps) => {
  const formatCurrency = (value: number | null, currency: string) => {
    if (!value) return `0 ${currency}`;
    return `${value.toLocaleString()} ${currency}`;
  };

  const getReasonLabel = (reason: string | null) => {
    const reasonMap: Record<string, string> = {
      damaged: 'Damaged Items',
      incorrect_quantity: 'Incorrect Quantity',
      not_ordered: 'Items Not Ordered',
      quality_issue: 'Quality Issue',
      late_delivery: 'Late Delivery',
      other: 'Other'
    };
    return reason ? reasonMap[reason] || reason : 'Not specified';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review Your Claim</h3>
        <p className="text-muted-foreground">
          Please review all details before submitting your claim
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Vendor Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Vendor Information
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit('vendor')}>
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {formData.vendor ? (
              <div>
                <h4 className="font-semibold">{formData.vendor.vendor_name}</h4>
                <p className="text-sm text-muted-foreground">
                  Code: <span className="font-mono">{formData.vendor.vendor_code}</span>
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No vendor selected</p>
            )}
          </CardContent>
        </Card>

        {/* Claim Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Claim Details
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit('details')}>
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Reason</label>
              <p>{getReasonLabel(formData.reason)}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Claim Value</label>
              <p className="font-semibold">{formatCurrency(formData.value, formData.currency)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Claim Items
            <Badge variant="secondary">{formData.items.length} item{formData.items.length !== 1 ? 's' : ''}</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit('items')}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {formData.items.length > 0 ? (
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{item.item_code}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Qty: {item.quantity}</p>
                      {item.unit_price && (
                        <p className="text-sm text-muted-foreground">
                          Unit Price: {item.unit_price}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No items added</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {formData.note && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{formData.note}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onSaveDraft}
          disabled={isSubmitting}
          variant="outline"
          className="flex-1"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Draft
        </Button>

        <Button
          onClick={onGeneratePdf}
          disabled={isSubmitting}
          variant="outline"
          className="flex-1"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Generate PDF
        </Button>

        <Button
          onClick={onSendEmail}
          disabled={isSubmitting}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          Submit Claim
        </Button>
      </div>
    </div>
  );
};

export default EnhancedClaimReviewSection;
