
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ReturnFormData {
  customer_code: string;
  product_code: string;
  return_quantity: number;
  reason: string;
  comment: string;
}

export const ReturnFormCard: React.FC = () => {
  const [formData, setFormData] = useState<ReturnFormData>({
    customer_code: '',
    product_code: '',
    return_quantity: 0,
    reason: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'return_quantity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('return_requests')
        .insert([{
          ...formData,
          return_date: new Date().toISOString(),
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success('Return request submitted successfully');
      setFormData({
        customer_code: '',
        product_code: '',
        return_quantity: 0,
        reason: '',
        comment: ''
      });
    } catch (error: any) {
      toast.error(`Failed to submit return request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Return Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customer_code">Customer Code</Label>
            <Input
              id="customer_code"
              name="customer_code"
              value={formData.customer_code}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="product_code">Product Code</Label>
            <Input
              id="product_code"
              name="product_code"
              value={formData.product_code}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="return_quantity">Quantity</Label>
            <Input
              id="return_quantity"
              name="return_quantity"
              type="number"
              min="1"
              value={formData.return_quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '📝 Submitting...' : 'Submit Return Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
