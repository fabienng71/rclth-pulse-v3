import React from 'react';
import { Button } from '@/components/ui/button';
import { type CrossBrowserTestSuite } from '@/utils/crossBrowserTesting';

interface CrossBrowserTestResultsProps {
  testReport: string;
  crossBrowserResults: CrossBrowserTestSuite | null;
  onDownloadResults: () => void;
}

export const CrossBrowserTestResults: React.FC<CrossBrowserTestResultsProps> = ({
  testReport,
  crossBrowserResults,
  onDownloadResults
}) => {
  return (
    <>
      {/* Cross-Browser Test Report */}
      {testReport && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">🌐 Cross-Browser Test Report</h3>
          <div className="p-4 bg-gray-900 text-green-400 rounded font-mono text-xs max-h-80 overflow-y-auto whitespace-pre-line">
            {testReport}
          </div>
        </div>
      )}

      {/* Cross-Browser Test Summary */}
      {crossBrowserResults && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">📊 Test Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">
                {crossBrowserResults.renderingEngine}
              </div>
              <div className="text-sm text-gray-600">Rendering Engine</div>
            </div>
            <div className="p-4 border rounded bg-green-50">
              <div className="text-2xl font-bold text-green-600">
                {crossBrowserResults.unicodeSupport.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">Unicode Support</div>
            </div>
            <div className="p-4 border rounded bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">
                {((crossBrowserResults.characterTests.filter(test => test.testPassed).length / 
                   crossBrowserResults.characterTests.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Pass Rate</div>
            </div>
          </div>
          
          {crossBrowserResults.recommendations.length > 0 && (
            <div className="p-4 border rounded bg-yellow-50">
              <h4 className="font-medium text-yellow-800 mb-2">💡 Recommendations:</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                {crossBrowserResults.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
};