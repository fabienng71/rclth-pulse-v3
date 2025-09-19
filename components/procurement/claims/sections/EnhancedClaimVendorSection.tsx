
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Building, X } from 'lucide-react';
import { useVendorsData } from '@/hooks/useVendorsData';

interface Vendor {
  vendor_code: string;
  vendor_name: string;
}

interface EnhancedClaimVendorSectionProps {
  vendor: Vendor | null;
  onSelectVendor: (vendor: Vendor) => void;
  onClearVendor: () => void;
}

const EnhancedClaimVendorSection = ({
  vendor,
  onSelectVendor,
  onClearVendor
}: EnhancedClaimVendorSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { vendors, isLoading } = useVendorsData();

  const vendorsToShow = vendors.filter(v => 
    v.vendor_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10);

  if (vendor) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Selected Vendor</h3>
          <p className="text-muted-foreground">
            The claim will be filed against this vendor
          </p>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{vendor.vendor_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Code: <span className="font-mono">{vendor.vendor_code}</span>
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearVendor}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Change Vendor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Vendor</h3>
        <p className="text-muted-foreground">
          Choose the vendor you want to file a claim against
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendors by name or code..."
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading vendors...</p>
          </div>
        ) : vendorsToShow.length > 0 ? (
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {vendorsToShow.map((vendorItem) => (
              <Card
                key={vendorItem.vendor_code}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onSelectVendor(vendorItem)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{vendorItem.vendor_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Code: <span className="font-mono">{vendorItem.vendor_code}</span>
                      </p>
                    </div>
                    <Badge variant="outline">Select</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No vendors found matching your search' : 'No vendors available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedClaimVendorSection;
