import React from 'react';

interface HttpResponseHeadersProps {
  responseHeaders: Record<string, string>;
}

export const HttpResponseHeaders: React.FC<HttpResponseHeadersProps> = ({ responseHeaders }) => {
  if (Object.keys(responseHeaders).length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">📡 HTTP Response Headers</h3>
      <div className="bg-gray-900 text-green-400 p-4 rounded text-sm font-mono max-h-40 overflow-y-auto">
        {Object.entries(responseHeaders).map(([key, value]) => (
          <div key={key} className="mb-1">
            <span className="text-blue-300">{key}:</span> {value}
          </div>
        ))}
      </div>
    </div>
  );
};