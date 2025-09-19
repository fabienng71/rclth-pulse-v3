
declare global {
  interface Window {
    markAppInitialized?: () => void;
    appInitialized?: boolean;
    errorOccurred?: boolean;
  }
}

export {};
