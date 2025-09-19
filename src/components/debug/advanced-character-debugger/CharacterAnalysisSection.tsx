import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CharacterAnalysis {
  char: string;
  code: number;
  hex: string;
  name: string;
  inFont: boolean;
  rendersCorrectly: boolean;
  domContent: string;
  displayedAs: string;
}

interface CharacterAnalysisSectionProps {
  characterAnalysis: CharacterAnalysis[];
}

export const CharacterAnalysisSection: React.FC<CharacterAnalysisSectionProps> = ({ characterAnalysis }) => {
  if (characterAnalysis.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">🔍 Character Analysis</h3>
      <div className="space-y-3">
        {characterAnalysis.map((analysis, index) => (
          <div key={index} className="p-4 border rounded bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Character:</strong> 
                <span className="text-2xl ml-2">{analysis.char}</span>
              </div>
              <div>
                <strong>Code:</strong> U+{analysis.hex}
              </div>
              <div>
                <strong>Renders OK:</strong> 
                <Badge variant={analysis.rendersCorrectly ? "default" : "destructive"} className="ml-2">
                  {analysis.rendersCorrectly ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <strong>In Font:</strong>
                <Badge variant={analysis.inFont ? "default" : "destructive"} className="ml-2">
                  {analysis.inFont ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="col-span-full">
                <strong>Name:</strong> {analysis.name}
              </div>
              {!analysis.rendersCorrectly && (
                <div className="col-span-full text-red-600">
                  <strong>Issue:</strong> Expected '{analysis.domContent}' but displays as '{analysis.displayedAs}'
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};