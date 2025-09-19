
import React from 'react';

const REASONS = [
  { value: 'damaged', label: 'Damaged' },
  { value: 'incorrect_quantity', label: 'Incorrect Invoiced Quantity' },
  { value: 'not_ordered', label: 'Not Ordered' }
];

const ClaimReasonSelect = ({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (reason: string) => void;
  disabled: boolean;
}) => (
  <div>
    <label className="block font-semibold mb-1">Claim Reason <span className="text-destructive">*</span></label>
    <select className="w-full border rounded p-2" value={value || ''} disabled={disabled}
      onChange={e => onChange(e.target.value)}>
      <option value="">Select reason...</option>
      {REASONS.map(r => (
        <option key={r.value} value={r.value}>{r.label}</option>
      ))}
    </select>
  </div>
);

export default ClaimReasonSelect;
