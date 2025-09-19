
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FileText } from 'lucide-react';

interface EnhancedClaimDetailsSectionProps {
  reason: string | null;
  note: string;
  value: number | null;
  currency: string;
  onReasonChange: (reason: string) => void;
  onNoteChange: (note: string) => void;
  onValueChange: (value: number | null) => void;
  onCurrencyChange: (currency: string) => void;
}

const NOTE_TEMPLATES = [
  {
    label: 'Damaged',
    value: 'We have received the items specified above in damaged condition. Kindly arrange for replacement or credit.'
  },
  {
    label: 'Incorrect Quantity',
    value: 'The received quantity does not match the invoice or purchase order. Please investigate the discrepancy and advise next steps.'
  },
  {
    label: 'Not Ordered',
    value: 'We have received goods that were not part of our order. Please arrange to collect them at your earliest convenience.'
  }
];

// Updated currency options to match database constraints
const CURRENCY_OPTIONS = [
  { value: 'THB', label: 'Thai Baht (THB)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' }
];

const EnhancedClaimDetailsSection = ({
  reason,
  note,
  value,
  currency,
  onReasonChange,
  onNoteChange,
  onValueChange,
  onCurrencyChange
}: EnhancedClaimDetailsSectionProps) => {
  const applyTemplate = (templateValue: string) => {
    onNoteChange(templateValue);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Claim Details</h3>
        <p className="text-muted-foreground">
          Provide the reason for your claim and additional details
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Claim Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Claim Reason *</Label>
              <Select value={reason || ''} onValueChange={onReasonChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select claim reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="damaged">Damaged Items</SelectItem>
                  <SelectItem value="incorrect_quantity">Incorrect Quantity</SelectItem>
                  <SelectItem value="not_ordered">Items Not Ordered</SelectItem>
                  <SelectItem value="quality_issue">Quality Issue</SelectItem>
                  <SelectItem value="late_delivery">Late Delivery</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Claim Value *</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={value || ''}
                  onChange={(e) => onValueChange(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select value={currency} onValueChange={onCurrencyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes & Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Quick Templates</Label>
              <div className="flex flex-wrap gap-2">
                {NOTE_TEMPLATES.map((template) => (
                  <Button
                    key={template.label}
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template.value)}
                  >
                    {template.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Provide additional details about your claim..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={6}
        />
      </div>
    </div>
  );
};

export default EnhancedClaimDetailsSection;
