import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Info } from 'lucide-react';
import { MTDDataOptions } from '@/hooks/useMTDData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MTDDataExclusionControlsProps {
  options: MTDDataOptions;
  onOptionsChange: (options: MTDDataOptions) => void;
  isLoading?: boolean;
}

export const MTDDataExclusionControls: React.FC<MTDDataExclusionControlsProps> = ({
  options,
  onOptionsChange,
  isLoading = false,
}) => {
  const handleDeliveryFeesChange = (checked: boolean) => {
    onOptionsChange({
      ...options,
      includeDeliveryFees: checked,
    });
  };

  const handleCreditMemosChange = (checked: boolean) => {
    onOptionsChange({
      ...options,
      includeCreditMemos: checked,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Data Inclusion Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="delivery-fees" className="text-sm font-medium">
                Include Delivery Fees
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Include service fees and delivery charges in sales calculations</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Transactions with item_code IS NULL AND posting_group = 'SRV')
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="delivery-fees"
              checked={options.includeDeliveryFees}
              onCheckedChange={handleDeliveryFeesChange}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="credit-memos" className="text-sm font-medium">
                Include Credit Memos
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Include credit memo adjustments in net sales calculations</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      When enabled, credit memos are subtracted from gross sales
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="credit-memos"
              checked={options.includeCreditMemos}
              onCheckedChange={handleCreditMemosChange}
              disabled={isLoading}
            />
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Current Settings:</p>
              <div className="space-y-1">
                <p>• Delivery Fees: {options.includeDeliveryFees ? 'Included' : 'Excluded'}</p>
                <p>• Credit Memos: {options.includeCreditMemos ? 'Included' : 'Excluded'}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};