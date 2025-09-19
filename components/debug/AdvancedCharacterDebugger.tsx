import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BrowserEnvironmentInfo,
  HttpResponseHeaders,
  FontLoadingStatusGrid,
  CharacterAnalysisSection,
  RenderingMethodTests,
  CrossBrowserTestResults,
  RawDataDisplay
} from './advanced-character-debugger';
import { DebuggerTrigger } from './DebuggerTrigger';
import { DebuggerActions } from './DebuggerActions';
import { useFontTesting } from '@/hooks/useFontTesting';
import { useCharacterAnalysis } from '@/hooks/useCharacterAnalysis';
import { useBrowserInfo } from '@/hooks/useBrowserInfo';
import { useSupabaseDataFetching } from '@/hooks/useSupabaseDataFetching';
import { useCrossBrowserTesting } from '@/hooks/useCrossBrowserTesting';

export const AdvancedCharacterDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const testCharacters = [
    { char: '°', name: 'Degree Symbol', code: 0x00B0 },
    { char: 'é', name: 'E with Acute', code: 0x00E9 },
    { char: 'è', name: 'E with Grave', code: 0x00E8 },
    { char: '€', name: 'Euro Sign', code: 0x20AC },
    { char: 'ñ', name: 'N with Tilde', code: 0x00F1 },
  ];

  const { fontTests, runFontTests } = useFontTesting();
  const { characterAnalysis, testDivRef, analyzeCharacters } = useCharacterAnalysis();
  const { browserInfo, collectBrowserInfo } = useBrowserInfo();
  const { oysterData, responseHeaders, interceptSupabaseResponse } = useSupabaseDataFetching();
  const { 
    crossBrowserResults, 
    testReport, 
    isRunningTests, 
    runCrossBrowserTestSuite, 
    downloadTestResults 
  } = useCrossBrowserTesting();

  const runFullDiagnosis = async () => {
    console.log('🔬 Running full character encoding diagnosis...');
    
    // Get browser info
    collectBrowserInfo();
    
    // Test font loading
    await runFontTests();
    
    // Get data and headers
    await interceptSupabaseResponse();
  };

  useEffect(() => {
    if (isVisible && oysterData) {
      analyzeCharacters(oysterData);
    }
  }, [isVisible, oysterData]);

  if (!isVisible) {
    return <DebuggerTrigger onOpen={() => setIsVisible(true)} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto p-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>🔬 Advanced Character Encoding Debugger</CardTitle>
          <DebuggerActions
            onRunDiagnosis={runFullDiagnosis}
            onRunCrossBrowserTest={runCrossBrowserTestSuite}
            onDownloadResults={downloadTestResults}
            onClose={() => setIsVisible(false)}
            isRunningTests={isRunningTests}
            hasResults={!!crossBrowserResults}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Hidden test elements */}
          <div ref={testDivRef} className="opacity-0 absolute -top-1000" style={{ fontFamily: 'Inter' }} />
          <canvas ref={canvasRef} width="100" height="100" className="hidden" />

          {/* Browser Environment */}
          {browserInfo && <BrowserEnvironmentInfo browserInfo={browserInfo} />}

          {/* HTTP Response Headers */}
          <HttpResponseHeaders responseHeaders={responseHeaders} />

          {/* Font Loading Status */}
          <FontLoadingStatusGrid fontTests={fontTests} />

          {/* Character Analysis */}
          <CharacterAnalysisSection characterAnalysis={characterAnalysis} />

          {/* Test Characters with Different Methods */}
          <RenderingMethodTests testCharacters={testCharacters} />

          {/* Cross-Browser Test Results */}
          <CrossBrowserTestResults 
            testReport={testReport}
            crossBrowserResults={crossBrowserResults}
            onDownloadResults={downloadTestResults}
          />

          {/* Raw Data Display */}
          {oysterData && <RawDataDisplay oysterData={oysterData} />}

        </CardContent>
      </Card>
    </div>
  );
};