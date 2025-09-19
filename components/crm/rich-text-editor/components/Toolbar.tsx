
import React from 'react';
import { Editor } from '@tiptap/react';
import { Separator } from '@/components/ui/separator';
import { FormatButtons } from './FormatButtons';
import { ListButtons } from './ListButtons';
import { FontControls } from './FontControls';

interface ToolbarProps {
  editor: Editor;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  return (
    <div className="flex items-center gap-2 bg-muted p-2 rounded-t-md border-b flex-wrap">
      <FormatButtons editor={editor} />
      
      <Separator orientation="vertical" className="h-6" />
      
      <ListButtons editor={editor} />
      
      <Separator orientation="vertical" className="h-6" />
      
      <FontControls editor={editor} />
    </div>
  );
};
