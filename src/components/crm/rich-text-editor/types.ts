
export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const fontSizes = [
  '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px'
];

export const fontFamilies = [
  { name: 'Default', value: 'Inter' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Courier New', value: 'Courier New' },
];
