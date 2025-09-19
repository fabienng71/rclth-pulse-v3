
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { ClaimFormData } from './EnhancedClaimForm';

function generateClaimNumber() {
  // Generate a cryptographically secure random string
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomBytes = crypto.getRandomValues(new Uint8Array(4));
  const randomHex = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `CLM-${timestamp}-${randomHex}`;
}

export function useEnhancedClaimForm() {
  const { profile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ClaimFormData, action: 'draft' | 'email' | 'pdf') => {
    setIsSubmitting(true);
    try {
      if (!profile?.id) throw new Error('Not authenticated');
      if (!data.vendor) throw new Error('Vendor required');
      
      // Validation based on action
      if (action === 'email') {
        if (!data.items.length) throw new Error('At least one item required');
        if (!data.reason) throw new Error('Reason required');
        if (!data.value) throw new Error('Claim value required');
      }

      const claimNumber = generateClaimNumber();
      const status = action === 'draft' ? 'draft' : 'sent';

      // Create claim record
      const { data: claimRes, error: claimErr } = await supabase
        .from('claims')
        .insert([{
          claim_number: claimNumber,
          vendor_code: data.vendor.vendor_code,
          vendor_name: data.vendor.vendor_name,
          reason: data.reason,
          notes: data.note,
          claim_value: data.value,
          currency: data.currency,
          status,
          created_by: profile.id,
        }])
        .select()
        .single();

      if (claimErr) throw claimErr;
      if (!claimRes) throw new Error('Claim saving failed');

      // Create claim items
      for (const item of data.items) {
        await supabase.from('claim_items').insert([{
          claim_id: claimRes.id,
          item_code: item.item_code,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_amount: ((item.unit_price || 0) * (item.quantity || 0)) || null,
        }]);
      }

      // Handle different actions
      switch (action) {
        case 'draft':
          toast.success('Draft claim saved successfully!');
          break;
        case 'email':
          toast.success('Claim submitted and email sent successfully!');
          break;
        case 'pdf':
          // PDF generation logic with professional format
          import('./professionalClaimPdfHelpers').then(({ generateProfessionalClaimPdf }) => {
            generateProfessionalClaimPdf({
              claim: {
                vendor: data.vendor,
                items: data.items,
                reason: data.reason,
                note: data.note,
                value: data.value,
                currency: data.currency,
                claimNumber: claimNumber,
              }
            });
          });
          break;
      }

    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : `Error ${action === 'draft' ? 'saving draft' : 'submitting claim'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
}
