
import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormatButtonsProps {
  editor: Editor;
}

export const FormatButtons: React.FC<FormatButtonsProps> = ({ editor }) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-secondary' : ''}`}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-secondary' : ''}`}
      >
        <Italic className="h-4 w-4" />
      </Button>
    </div>
  );
};
