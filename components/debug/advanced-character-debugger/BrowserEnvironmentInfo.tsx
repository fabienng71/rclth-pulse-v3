import React from 'react';

interface BrowserInfo {
  userAgent: string;
  platform: string;
  language: string;
  fontSupport: any[];
  renderingEngine: string;
}

interface BrowserEnvironmentInfoProps {
  browserInfo: BrowserInfo;
}

export const BrowserEnvironmentInfo: React.FC<BrowserEnvironmentInfoProps> = ({ browserInfo }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">🌐 Browser Environment</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-gray-50 rounded">
          <strong>Rendering Engine:</strong> {browserInfo.renderingEngine}
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <strong>Platform:</strong> {browserInfo.platform}
        </div>
        <div className="p-3 bg-gray-50 rounded col-span-full">
          <strong>User Agent:</strong> <span className="text-xs">{browserInfo.userAgent}</span>
        </div>
      </div>
    </div>
  );
};