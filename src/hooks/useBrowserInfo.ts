import { useState } from 'react';

interface FontLoadingStatus {
  fontName: string;
  loaded: boolean;
  supported: boolean;
  hasUnicode: boolean;
}

interface BrowserInfo {
  userAgent: string;
  platform: string;
  language: string;
  fontSupport: FontLoadingStatus[];
  renderingEngine: string;
}

export const useBrowserInfo = () => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);

  const getBrowserInfo = (): BrowserInfo => {
    const ua = navigator.userAgent;
    let renderingEngine = 'Unknown';
    
    if (ua.includes('WebKit')) {
      if (ua.includes('Chrome')) renderingEngine = 'Blink (Chrome)';
      else if (ua.includes('Safari')) renderingEngine = 'WebKit (Safari)';
      else renderingEngine = 'WebKit';
    } else if (ua.includes('Gecko')) {
      renderingEngine = 'Gecko (Firefox)';
    }

    return {
      userAgent: ua,
      platform: navigator.platform,
      language: navigator.language,
      fontSupport: [],
      renderingEngine
    };
  };

  const collectBrowserInfo = () => {
    const info = getBrowserInfo();
    setBrowserInfo(info);
    return info;
  };

  return {
    browserInfo,
    setBrowserInfo,
    collectBrowserInfo,
  };
};