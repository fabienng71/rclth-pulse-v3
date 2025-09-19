
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { FontSize } from './FontSize';

export const getExtensions = () => [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc pl-6', // Add Tailwind classes for bullet lists
      },
      keepMarks: true,
      keepAttributes: true,
    },
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal pl-6', // Add Tailwind classes for numbered lists
      },
      keepMarks: true,
      keepAttributes: true,
    },
    paragraph: {
      HTMLAttributes: {
        class: 'mb-2',
      },
    },
    listItem: {
      HTMLAttributes: {
        class: 'ml-2 pl-1', // Ensure list items have proper spacing
      },
    },
  }),
  TextStyle,
  FontFamily,
  FontSize,
];
