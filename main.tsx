
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

console.log('=== MAIN.TSX: Starting application ===');

// Create QueryClient with basic configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      retryOnMount: true,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Get root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('=== MAIN.TSX: Root element not found! ===');
  throw new Error('Root element not found');
}

console.log('=== MAIN.TSX: Creating React root and rendering App ===');
const root = createRoot(rootElement);

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

console.log('=== MAIN.TSX: App rendered successfully ===');
