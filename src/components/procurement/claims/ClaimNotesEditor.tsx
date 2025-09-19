import React from 'react';
import { RichTextEditor } from '@/components/crm/RichTextEditor';

interface Props {
  value: string;
  onChange: (value: string) => void;
  templates: { label: string; value: string }[];
  onTemplateSelect: (value: string) => void;
  disabled: boolean;
}

const ClaimNotesEditor: React.FC<Props> = ({
  value, onChange, templates, onTemplateSelect, disabled
}) => (
  <div>
    <label className="block font-semibold mb-1">Notes</label>
    <div className="flex gap-2 mb-2">
      {templates.map(tpl => (
        <button type="button" key={tpl.label}
          className="text-xs py-1 px-2 rounded bg-accent hover:bg-primary/70"
          onClick={() => onTemplateSelect(tpl.value)} disabled={disabled}>
          {tpl.label}
        </button>
      ))}
    </div>
    <RichTextEditor value={value} onChange={onChange} readOnly={disabled} />
  </div>
);

export default ClaimNotesEditor;
