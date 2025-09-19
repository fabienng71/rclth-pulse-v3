
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group TipTap and prosemirror packages together
          'tiptap': [
            '@tiptap/core',
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-text-style',
            '@tiptap/extension-font-family',
            '@tiptap/extension-bubble-menu'
          ],
          'prosemirror': [
            'prosemirror-state',
            'prosemirror-view',
            'prosemirror-model',
            'prosemirror-transform',
            'prosemirror-commands',
            'prosemirror-keymap',
            'prosemirror-history',
            'prosemirror-inputrules',
            'prosemirror-gapcursor',
            'prosemirror-dropcursor'
          ]
        }
      }
    },
  },
  optimizeDeps: {
    include: [
      '@tiptap/core',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-text-style',
      '@tiptap/extension-font-family',
      '@tiptap/extension-bubble-menu',
      'prosemirror-state',
      'prosemirror-view',
      'prosemirror-model',
      'prosemirror-transform',
      'prosemirror-commands',
      'prosemirror-keymap',
      'prosemirror-history',
      'prosemirror-inputrules',
      'prosemirror-gapcursor',
      'prosemirror-dropcursor'
    ]
  }
}));
