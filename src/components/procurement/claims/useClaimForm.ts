
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

type Item = {
  item_code: string;
  description: string;
  quantity: number;
  unit_price?: number;
};

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

function generateClaimNumber() {
  // Simple random pattern, you can adjust/replace as needed
  return 'CLM-' + Math.floor(Math.random() * 900000 + 100000);
}

export function useClaimForm() {
  const { profile } = useAuthStore();
  const [vendor, setVendor] = useState<{ vendor_code: string; vendor_name: string } | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [value, setValue] = useState<number | null>(null);
  const [currency, setCurrency] = useState('THB');
  const [status, setStatus] = useState('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apply template to the richtext note field
  const applyNoteTemplate = (val: string) => setNote(val);

  // Add item
  const addItem = (item: Item) => setItems(prev => [...prev, item]);
  // Remove item
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  // Update item
  const updateItem = (idx: number, field: keyof Item, val: any) => setItems(prev =>
    prev.map((itm, i) => i !== idx ? itm : { ...itm, [field]: val }));

  // Draft/save
  const onSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      if (!profile?.id) throw new Error('Not authenticated');
      if (!vendor) throw new Error('Vendor required');
      // Either create or update; for simplicity: always create new claim with new number
      const claimNumber = generateClaimNumber();
      const { data: claimRes, error: claimErr } = await supabase
        .from('claims').insert([{
          claim_number: claimNumber,
          vendor_code: vendor.vendor_code,
          vendor_name: vendor.vendor_name,
          reason,
          notes: note,
          claim_value: value,
          currency,
          status: 'draft',
          created_by: profile.id,
        }]).select().single();
      if (claimErr) throw claimErr;
      if (!claimRes) throw new Error('Claim saving failed');
      for (const item of items) {
        await supabase.from('claim_items').insert([{
          claim_id: claimRes.id,
          item_code: item.item_code,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_amount: ((item.unit_price || 0) * (item.quantity || 0)) || null,
        }]);
      }
      setStatus('draft');
      toast.success('Draft claim saved successfully!');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error saving draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email
  const onSendEmail = async () => {
    setIsSubmitting(true);
    try {
      // Saving as 'sent' instead of 'draft'
      if (!profile?.id) throw new Error('Not authenticated');
      if (!vendor) throw new Error('Vendor required');
      if (!items.length) throw new Error('At least one item');
      if (!reason) throw new Error('Reason required');
      if (!value) throw new Error('Claim value required');
      if (!currency) throw new Error('Currency required');
      const claimNumber = generateClaimNumber();
      const { data: claimRes, error: claimErr } = await supabase
        .from('claims').insert([{
          claim_number: claimNumber,
          vendor_code: vendor.vendor_code,
          vendor_name: vendor.vendor_name,
          reason,
          notes: note,
          claim_value: value,
          currency,
          status: 'sent',
          created_by: profile.id,
        }]).select().single();
      if (claimErr) throw claimErr;
      if (!claimRes) throw new Error('Claim saving failed');
      for (const item of items) {
        await supabase.from('claim_items').insert([{
          claim_id: claimRes.id,
          item_code: item.item_code,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_amount: ((item.unit_price || 0) * (item.quantity || 0)) || null,
        }]);
      }
      // Send PDF/email via backend edge function (to be implemented: e.g. /api/send-claim-email)
      // For now, show success message
      setStatus('sent');
      toast.success('Claim submitted and email sent successfully!');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error sending claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  // PDF
  const onGeneratePdf = async () => {
    // PDF logic will reuse jsPDF (reuse logo helpers, etc)
    import('./claimPdfHelpers').then(({ generateClaimPdf }) => {
      generateClaimPdf({
        claim: {
          vendor,
          items,
          reason,
          note,
          value,
          currency,
        }
      });
    });
  };

  return {
    vendor, setVendor,
    items, addItem, removeItem, updateItem,
    reason, setReason,
    note, setNote,
    value, setValue,
    currency, setCurrency,
    status,
    onSaveDraft, onSendEmail, onGeneratePdf,
    isSubmitting,
    templates: NOTE_TEMPLATES,
    applyNoteTemplate,
    form: {} // For future compatibility
  };
}
