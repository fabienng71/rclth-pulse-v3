import { useState } from 'react';
import { 
  runCrossBrowserTest, 
  generateTestReport, 
  exportTestResults, 
  type CrossBrowserTestSuite 
} from '@/utils/crossBrowserTesting';

export const useCrossBrowserTesting = () => {
  const [crossBrowserResults, setCrossBrowserResults] = useState<CrossBrowserTestSuite | null>(null);
  const [testReport, setTestReport] = useState<string>('');
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runCrossBrowserTestSuite = async () => {
    setIsRunningTests(true);
    console.log('🌐 Running cross-browser character encoding test suite...');
    
    try {
      const results = await runCrossBrowserTest();
      setCrossBrowserResults(results);
      
      const report = generateTestReport(results);
      setTestReport(report);
      
      console.log('📊 Cross-browser test completed:', results);
    } catch (error) {
      console.error('❌ Cross-browser test failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const downloadTestResults = () => {
    if (crossBrowserResults) {
      const blob = exportTestResults(crossBrowserResults);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `character-encoding-test-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return {
    crossBrowserResults,
    testReport,
    isRunningTests,
    runCrossBrowserTestSuite,
    downloadTestResults,
  };
};