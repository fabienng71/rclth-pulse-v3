
import React from 'react';
import { Editor } from '@tiptap/react';
import { Type } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fontSizes, fontFamilies } from '../types';

interface FontControlsProps {
  editor: Editor;
}

export const FontControls: React.FC<FontControlsProps> = ({ editor }) => {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={editor.getAttributes('textStyle').fontSize || '16px'}
        onValueChange={(value) => {
          editor.chain().focus().command(({ chain }) => {
            return chain().setFontSize(value).run();
          });
        }}
      >
        <SelectTrigger className="h-8 w-[100px]">
          <Type className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
        onValueChange={(value) => {
          editor.chain().focus().setFontFamily(value).run();
        }}
      >
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {fontFamilies.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              {font.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
