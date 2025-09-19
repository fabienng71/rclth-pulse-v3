import { supabase } from '@/integrations/supabase/client';

interface EncodingIssue {
  table: string;
  column: string;
  id: string;
  original_value: string;
  corrected_value: string;
  issue_type: 'replacement_character' | 'mojibake' | 'invalid_utf8';
}

/**
 * Common character encoding fixes
 */
const ENCODING_FIXES: Array<{ pattern: RegExp; replacement: string; description: string }> = [
  // Fix replacement character (?) for degree symbol
  { pattern: /\s*\?\s*/g, replacement: '°', description: 'Replace ? with degree symbol' },
  
  // Fix common mojibake patterns
  { pattern: /Ã©/g, replacement: 'é', description: 'Fix é character' },
  { pattern: /Ã¨/g, replacement: 'è', description: 'Fix è character' },
  { pattern: /Ã¡/g, replacement: 'á', description: 'Fix á character' },
  { pattern: /Ã /g, replacement: 'à', description: 'Fix à character' },
  { pattern: /Ã§/g, replacement: 'ç', description: 'Fix ç character' },
  { pattern: /Ã¯/g, replacement: 'ï', description: 'Fix ï character' },
  { pattern: /Ã´/g, replacement: 'ô', description: 'Fix ô character' },
  { pattern: /Ã¹/g, replacement: 'ù', description: 'Fix ù character' },
  { pattern: /Ã»/g, replacement: 'û', description: 'Fix û character' },
  { pattern: /Ã±/g, replacement: 'ñ', description: 'Fix ñ character' },
  
  // Fix other common special characters that might show as ?
  { pattern: /\bn\s*\?\s*([0-9])/gi, replacement: 'n°$1', description: 'Fix n°X pattern' },
  { pattern: /([a-zA-Z])\s*\?\s*([0-9])/g, replacement: '$1°$2', description: 'Fix degree patterns' },
];

/**
 * Detect potential character encoding issues in a text value
 */
export const detectEncodingIssues = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;
  
  // Check for replacement characters (�) or question marks in suspicious patterns
  const replacementChar = /\ufffd|\\ufffd/g.test(text);
  const suspiciousQuestionMark = /[a-zA-Z]\s*\?\s*[0-9]/g.test(text);
  const mojibakePattern = /Ã[©¨¡ §¯´¹»±]/g.test(text);
  
  return replacementChar || suspiciousQuestionMark || mojibakePattern;
};

/**
 * Apply character encoding fixes to a text value
 */
export const fixEncodingIssues = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  let fixedText = text;
  
  for (const fix of ENCODING_FIXES) {
    fixedText = fixedText.replace(fix.pattern, fix.replacement);
  }
  
  return fixedText;
};

/**
 * Scan the items table for character encoding issues
 */
export const scanItemsForEncodingIssues = async (): Promise<EncodingIssue[]> => {
  try {
    console.log('Scanning items table for character encoding issues...');
    
    const { data: items, error } = await supabase
      .from('items')
      .select('item_code, description')
      .not('description', 'is', null);
    
    if (error) {
      console.error('Error scanning items:', error);
      throw error;
    }
    
    const issues: EncodingIssue[] = [];
    
    for (const item of items || []) {
      if (detectEncodingIssues(item.description)) {
        const correctedValue = fixEncodingIssues(item.description);
        
        if (correctedValue !== item.description) {
          issues.push({
            table: 'items',
            column: 'description',
            id: item.item_code,
            original_value: item.description,
            corrected_value: correctedValue,
            issue_type: item.description.includes('?') ? 'replacement_character' : 
                       item.description.includes('Ã') ? 'mojibake' : 'invalid_utf8'
          });
        }
      }
    }
    
    console.log(`Found ${issues.length} character encoding issues in items table`);
    return issues;
    
  } catch (error) {
    console.error('Error scanning items for encoding issues:', error);
    throw error;
  }
};

/**
 * Fix character encoding issues in the items table
 */
export const fixItemsEncodingIssues = async (issues: EncodingIssue[]): Promise<{
  success: boolean;
  fixed: number;
  errors: Array<{ id: string; error: string }>;
}> => {
  const results = {
    success: true,
    fixed: 0,
    errors: [] as Array<{ id: string; error: string }>
  };
  
  console.log(`Fixing ${issues.length} character encoding issues...`);
  
  for (const issue of issues) {
    try {
      const { error } = await supabase
        .from('items')
        .update({ description: issue.corrected_value })
        .eq('item_code', issue.id);
      
      if (error) {
        console.error(`Error fixing item ${issue.id}:`, error);
        results.errors.push({
          id: issue.id,
          error: error.message
        });
        results.success = false;
      } else {
        results.fixed++;
        console.log(`Fixed item ${issue.id}: "${issue.original_value}" → "${issue.corrected_value}"`);
      }
    } catch (error) {
      console.error(`Exception fixing item ${issue.id}:`, error);
      results.errors.push({
        id: issue.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      results.success = false;
    }
  }
  
  console.log(`Fixed ${results.fixed} items, ${results.errors.length} errors`);
  return results;
};

/**
 * Comprehensive scan and fix for character encoding issues
 */
export const scanAndFixEncodingIssues = async (): Promise<{
  scanned: number;
  issues_found: number;
  fixed: number;
  errors: Array<{ id: string; error: string }>;
  issues: EncodingIssue[];
}> => {
  try {
    console.log('Starting comprehensive character encoding scan and fix...');
    
    const issues = await scanItemsForEncodingIssues();
    
    if (issues.length === 0) {
      console.log('No character encoding issues found!');
      return {
        scanned: 0,
        issues_found: 0,
        fixed: 0,
        errors: [],
        issues: []
      };
    }
    
    const fixResults = await fixItemsEncodingIssues(issues);
    
    return {
      scanned: issues.length,
      issues_found: issues.length,
      fixed: fixResults.fixed,
      errors: fixResults.errors,
      issues: issues
    };
    
  } catch (error) {
    console.error('Error in scanAndFixEncodingIssues:', error);
    throw error;
  }
};

/**
 * Preview character encoding fixes without applying them
 */
export const previewEncodingFixes = async (): Promise<EncodingIssue[]> => {
  return await scanItemsForEncodingIssues();
};