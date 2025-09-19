import * as React from "react"
import { cn } from "@/lib/utils"
import { fixCharacterDisplay, hasCharacterDisplayIssue } from "@/utils/characterFixer"

interface EnhancedTableCellTextProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  value: string | undefined | null;
  strategy?: 'auto' | 'html' | 'fallback' | 'unicode' | 'force-html';
  enableFallback?: boolean;
}

export const EnhancedTableCellText = React.forwardRef<
  HTMLTableCellElement,
  EnhancedTableCellTextProps
>(({ className, value, strategy = 'auto', enableFallback = true, ...props }, ref) => {
  const [renderStrategy, setRenderStrategy] = React.useState<'text' | 'html' | 'fallback'>('text');
  const [processedValue, setProcessedValue] = React.useState<string>('');
  
  React.useEffect(() => {
    if (!value) {
      setProcessedValue('-');
      setRenderStrategy('text');
      return;
    }

    // Normalize Unicode first
    const normalizedValue = value.normalize('NFC');
    
    // Determine the best rendering strategy
    if (strategy === 'force-html' || (enableFallback && hasCharacterDisplayIssue(normalizedValue))) {
      const htmlFixed = fixCharacterDisplay(normalizedValue, 'html');
      setProcessedValue(htmlFixed);
      setRenderStrategy('html');
    } else if (strategy === 'fallback') {
      const fallbackFixed = fixCharacterDisplay(normalizedValue, 'fallback');
      setProcessedValue(fallbackFixed);
      setRenderStrategy('text');
    } else {
      // Try to use the original value but with normalization
      setProcessedValue(normalizedValue);
      setRenderStrategy('text');
    }
  }, [value, strategy, enableFallback]);

  const displayValue = processedValue === null || processedValue === undefined || processedValue === '' 
    ? '-' 
    : processedValue;
  
  const isEmpty = !displayValue || displayValue === '-' || displayValue.trim() === '';
  const valueClass = isEmpty
    ? "text-xs text-gray-400"
    : "text-sm text-gray-500";

  return (
    <td
      ref={ref}
      className={cn("p-4 align-middle unicode-text", valueClass, className)}
      style={{ 
        fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        fontFeatureSettings: '"liga" 1, "calt" 1, "kern" 1',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        unicodeBidi: 'embed',
        direction: 'ltr'
      }}
      {...props}
    >
      {renderStrategy === 'html' ? (
        <span 
          dangerouslySetInnerHTML={{ __html: displayValue }}
          style={{ fontFamily: 'inherit' }}
        />
      ) : (
        <span style={{ fontFamily: 'inherit' }}>
          {displayValue}
        </span>
      )}
    </td>
  );
});

EnhancedTableCellText.displayName = "EnhancedTableCellText";