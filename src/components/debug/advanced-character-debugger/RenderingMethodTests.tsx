import React from 'react';

interface TestCharacter {
  char: string;
  name: string;
  code: number;
}

interface RenderingMethodTestsProps {
  testCharacters: TestCharacter[];
}

export const RenderingMethodTests: React.FC<RenderingMethodTestsProps> = ({ testCharacters }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">🧪 Rendering Method Tests</h3>
      <div className="space-y-3">
        {testCharacters.map((test) => (
          <div key={test.char} className="p-4 border rounded">
            <h4 className="font-medium mb-2">{test.name} (U+{test.code.toString(16).toUpperCase()})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-2 bg-gray-100 rounded">
                <div className="text-xs text-gray-600 mb-1">Direct Text</div>
                <div className="text-2xl">{test.char}</div>
              </div>
              <div className="text-center p-2 bg-gray-100 rounded">
                <div className="text-xs text-gray-600 mb-1">HTML Entity</div>
                <div className="text-2xl" dangerouslySetInnerHTML={{ 
                  __html: test.char === '°' ? '&deg;' : 
                          test.char === 'é' ? '&eacute;' :
                          test.char === 'è' ? '&egrave;' : test.char 
                }} />
              </div>
              <div className="text-center p-2 bg-gray-100 rounded">
                <div className="text-xs text-gray-600 mb-1">Unicode Escape</div>
                <div className="text-2xl">{String.fromCharCode(test.code)}</div>
              </div>
              <div className="text-center p-2 bg-gray-100 rounded">
                <div className="text-xs text-gray-600 mb-1">CSS Content</div>
                <div className="text-2xl" style={{ fontFamily: 'Arial' }}>{test.char}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};