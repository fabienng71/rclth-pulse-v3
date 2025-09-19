
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export interface VendorFormData {
  vendor_code: string;
  vendor_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  country: string;
  payment_terms: string;
  active: boolean;
}

interface VendorFormProps {
  data: VendorFormData;
  setData: (data: VendorFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
  isLoading?: boolean;
}

const VendorForm: React.FC<VendorFormProps> = ({ 
  data, 
  setData, 
  onSubmit, 
  isEdit = false, 
  isLoading = false 
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vendor_code">Vendor Code *</Label>
        <Input
          id="vendor_code"
          value={data.vendor_code}
          onChange={(e) => setData({ ...data, vendor_code: e.target.value })}
          required
          disabled={isEdit || isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="vendor_name">Vendor Name *</Label>
        <Input
          id="vendor_name"
          value={data.vendor_name}
          onChange={(e) => setData({ ...data, vendor_name: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            type="email"
            value={data.contact_email}
            onChange={(e) => setData({ ...data, contact_email: e.target.value })}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input
            id="contact_phone"
            value={data.contact_phone}
            onChange={(e) => setData({ ...data, contact_phone: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          rows={2}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => setData({ ...data, city: e.target.value })}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={data.country}
            onChange={(e) => setData({ ...data, country: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_terms">Payment Terms</Label>
        <Input
          id="payment_terms"
          value={data.payment_terms}
          onChange={(e) => setData({ ...data, payment_terms: e.target.value })}
          placeholder="e.g., Net 30, COD, etc."
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={data.active}
          onCheckedChange={(checked) => setData({ ...data, active: checked })}
          disabled={isLoading}
        />
        <Label htmlFor="active">Active Vendor</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : (isEdit ? 'Update Vendor' : 'Create Vendor')}
        </Button>
      </div>
    </form>
  );
};

export default VendorForm;
