
import React from 'react';
import ClaimReasonSelect from './ClaimReasonSelect';
import ClaimNotesEditor from './ClaimNotesEditor';
import ClaimCurrencySelect from './ClaimCurrencySelect';

interface Props {
  reason: string | null;
  setReason: (reason: string) => void;
  note: string;
  setNote: (value: string) => void;
  templates: { label: string; value: string }[];
  applyNoteTemplate: (text: string) => void;
  value: number | null;
  setValue: (v: number | null) => void;
  currency: string;
  setCurrency: (c: string) => void;
  disabled: boolean;
}

const ClaimDetailsSection: React.FC<Props> = ({
  reason, setReason,
  note, setNote,
  templates, applyNoteTemplate,
  value, setValue,
  currency, setCurrency,
  disabled
}) => (
  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <ClaimReasonSelect value={reason} onChange={setReason} disabled={disabled} />
      <div className="mt-4">
        <ClaimNotesEditor
          value={note}
          onChange={setNote}
          templates={templates}
          onTemplateSelect={applyNoteTemplate}
          disabled={disabled}
        />
      </div>
    </div>
    <div>
      <label className="block font-semibold mb-1">Claim Value <span className="text-destructive">*</span></label>
      <input
        type="number"
        placeholder="Enter claim amount"
        className="w-full border rounded p-2 mb-2"
        value={value === null ? '' : value}
        min={0}
        onChange={e => setValue(e.target.value === '' ? null : parseFloat(e.target.value))}
        disabled={disabled}
      />
      <ClaimCurrencySelect value={currency} onChange={setCurrency} disabled={disabled} />
    </div>
  </div>
);

export default ClaimDetailsSection;
