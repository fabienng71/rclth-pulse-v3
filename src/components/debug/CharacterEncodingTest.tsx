import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CharacterTest {
  character: string;
  name: string;
  unicode: string;
  displayCorrect: boolean;
}

export const CharacterEncodingTest: React.FC = () => {
  const [testResults, setTestResults] = useState<CharacterTest[]>([]);
  const [oysterData, setOysterData] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const testCharacters: CharacterTest[] = [
    { character: '°', name: 'Degree Symbol', unicode: 'U+00B0', displayCorrect: false },
    { character: 'é', name: 'Latin Small Letter E with Acute', unicode: 'U+00E9', displayCorrect: false },
    { character: 'è', name: 'Latin Small Letter E with Grave', unicode: 'U+00E8', displayCorrect: false },
    { character: 'à', name: 'Latin Small Letter A with Grave', unicode: 'U+00E0', displayCorrect: false },
    { character: 'ç', name: 'Latin Small Letter C with Cedilla', unicode: 'U+00E7', displayCorrect: false },
    { character: 'ñ', name: 'Latin Small Letter N with Tilde', unicode: 'U+00F1', displayCorrect: false },
    { character: '€', name: 'Euro Sign', unicode: 'U+20AC', displayCorrect: false },
  ];

  const fetchOysterData = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('description')
        .eq('item_code', 'IFC0WW0000155')
        .single();
      
      if (error) throw error;
      setOysterData(data.description);
    } catch (error) {
      console.error('Error fetching oyster data:', error);
      setOysterData('Error loading data');
    }
  };

  const runCharacterTests = () => {
    const results = testCharacters.map(test => ({
      ...test,
      displayCorrect: test.character === test.character // Simple test for now
    }));
    setTestResults(results);
  };

  useEffect(() => {
    if (isVisible) {
      fetchOysterData();
      runCharacterTests();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
        >
          🔧 Character Test
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-2xl overflow-auto">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Character Encoding Debug Tool</CardTitle>
          <Button 
            onClick={() => setIsVisible(false)}
            variant="ghost" 
            size="sm"
          >
            ✕ Close
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Real Data Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Real Data Test: Oyster Fines de Claire</h3>
            <div className="p-4 bg-gray-50 rounded border">
              <p><strong>Database Value:</strong></p>
              <div className="mt-2 p-2 bg-white border rounded font-mono text-sm">
                {oysterData || 'Loading...'}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Expected: "Oyster Fines de Claire n°3 David Herve | Box w/48pcs"
              </p>
            </div>
          </div>

          {/* Character Tests */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Unicode Character Tests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testCharacters.map((test, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span 
                        className="text-2xl font-bold unicode-text"
                        style={{
                          fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                          textRendering: 'optimizeLegibility',
                        }}
                      >
                        {test.character}
                      </span>
                      <div className="text-sm">
                        <div className="font-medium">{test.name}</div>
                        <div className="text-gray-600">{test.unicode}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Test in different contexts */}
                  <div className="mt-2 text-xs space-y-1">
                    <div>In span: <span className="unicode-text">{test.character}</span></div>
                    <div>In div: <div className="inline unicode-text">{test.character}</div></div>
                    <div>Raw HTML: <span dangerouslySetInnerHTML={{ __html: test.character }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Font Stack Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Font Stack Test</h3>
            <div className="space-y-2">
              <div className="p-2 bg-gray-50 border rounded">
                <div className="text-sm font-medium">Inter Font:</div>
                <div style={{ fontFamily: '"Inter", sans-serif' }} className="text-lg">
                  Test: n°3 é è à ç ñ € • ° ¼ ½ ¾
                </div>
              </div>
              <div className="p-2 bg-gray-50 border rounded">
                <div className="text-sm font-medium">System UI:</div>
                <div style={{ fontFamily: 'system-ui' }} className="text-lg">
                  Test: n°3 é è à ç ñ € • ° ¼ ½ ¾
                </div>
              </div>
              <div className="p-2 bg-gray-50 border rounded">
                <div className="text-sm font-medium">Arial:</div>
                <div style={{ fontFamily: 'Arial' }} className="text-lg">
                  Test: n°3 é è à ç ñ € • ° ¼ ½ ¾
                </div>
              </div>
              <div className="p-2 bg-gray-50 border rounded">
                <div className="text-sm font-medium">Noto Sans (Unicode Safe):</div>
                <div style={{ fontFamily: '"Noto Sans", sans-serif' }} className="text-lg">
                  Test: n°3 é è à ç ñ € • ° ¼ ½ ¾
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button onClick={() => window.location.reload()} variant="outline">
              🔄 Reload Page
            </Button>
            <Button onClick={() => console.log('Oyster data:', oysterData)} variant="outline">
              📝 Log to Console
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};