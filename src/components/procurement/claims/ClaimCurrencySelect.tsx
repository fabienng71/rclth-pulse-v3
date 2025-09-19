
import React from 'react';

const CURRENCIES = [
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'THB', label: 'Thai Baht (THB)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
];

const ClaimCurrencySelect = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (c: string) => void;
  disabled: boolean;
}) => (
  <div>
    <label className="block font-semibold mb-1">Currency</label>
    <select className="w-full border rounded p-2" value={value} disabled={disabled}
      onChange={e => onChange(e.target.value)}>
      {CURRENCIES.map(c => (
        <option key={c.value} value={c.value}>{c.label}</option>
      ))}
    </select>
  </div>
);

export default ClaimCurrencySelect;
