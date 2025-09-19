
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { getExtensions } from './extensions';
import { Toolbar } from './components/Toolbar';
import { RichTextEditorProps } from './types';

export const RichTextEditor = ({ value, onChange, readOnly = false }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: getExtensions(),
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 focus:outline-none min-h-[150px] break-words overflow-wrap-anywhere word-break-break-word',
      },
    },
    editable: !readOnly,
  });

  // This effect ensures external value changes are reflected in the editor
  // without disrupting the user's editing experience
  useEffect(() => {
    // Only update content if editor exists and the HTML content has actually changed
    if (editor && value !== editor.getHTML()) {
      // Preserve selection and focus state
      const { from, to } = editor.state.selection;
      const wasFocused = editor.isFocused;
      
      // Set content without resetting history or selection
      editor.commands.setContent(value || '<p></p>', false);
      
      // Restore selection and focus if needed
      if (wasFocused && !readOnly) {
        editor.commands.setTextSelection({ from, to });
        editor.commands.focus();
      }
    }
  }, [editor, value, readOnly]);

  useEffect(() => {
    // Update editable state when readOnly prop changes
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border rounded-md max-w-full overflow-hidden ${readOnly ? 'bg-gray-50' : ''}`}>
      {!readOnly && <Toolbar editor={editor} />}
      <EditorContent 
        editor={editor} 
        className={`${readOnly ? 'opacity-75 cursor-default' : ''} break-words overflow-wrap-anywhere max-w-full`}
      />
    </div>
  );
};

// Export from index
export * from './types';
