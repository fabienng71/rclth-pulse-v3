import React from 'react';
import { quickCharacterCheck } from '@/utils/crossBrowserTesting';

interface RawDataDisplayProps {
  oysterData: string;
}

export const RawDataDisplay: React.FC<RawDataDisplayProps> = ({ oysterData }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">📄 Raw Data from Database</h3>
      <div className="p-4 bg-gray-900 text-green-400 rounded font-mono text-sm">
        <div><strong>Description:</strong> {oysterData}</div>
        <div><strong>JSON:</strong> {JSON.stringify(oysterData)}</div>
        <div><strong>Length:</strong> {oysterData.length} characters</div>
        {oysterData && (
          <div className="mt-2">
            <strong>Quick Check:</strong>
            <div className="ml-2 text-xs">
              {(() => {
                const check = quickCharacterCheck(oysterData);
                return (
                  <>
                    <div>Special characters: {check.hasSpecialChars ? 'Yes' : 'No'}</div>
                    {check.problematicChars.length > 0 && (
                      <div>Problematic: {check.problematicChars.join(', ')}</div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};