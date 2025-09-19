import { SALES_HEADER_MAPPING } from '../utils/excel/headerMappings';
import { parseExcelDate } from '../utils/excel/dateParser';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  qualityScore: number; // 0-100
  recommendations: string[];
}

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  error: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fixSuggestion?: string;
}

export interface ValidationWarning {
  row: number;
  field: string;
  value: any;
  warning: string;
  impact: string;
}

export interface DataQualityMetrics {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  incompleteRecords: number;
  suspiciousRecords: number;
  dataCompleteness: number; // Percentage
  dataConsistency: number; // Percentage
  expectedConstraintViolations: number;
  memoryRequirementMB: number;
  estimatedProcessingTime: number;
}

export interface FieldValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'boolean';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: any, record: any, index: number) => ValidationError | null;
}

class DataValidationService {
  private validationRules: FieldValidationRule[] = [
    {
      field: 'customer_code',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: /^[A-Z0-9]+$/i
    },
    {
      field: 'customer_name',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    {
      field: 'document_no',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
      customValidator: (value, record, index) => {
        if (!value || typeof value !== 'string') {
          return {
            row: index + 1,
            field: 'document_no',
            value,
            error: 'Document number is required and must be a string',
            severity: 'critical',
            fixSuggestion: 'Provide a valid document number'
          };
        }
        return null;
      }
    },
    {
      field: 'posting_date',
      required: true,
      type: 'date',
      customValidator: (value, record, index) => {
        if (!value) {
          return {
            row: index + 1,
            field: 'posting_date',
            value,
            error: 'Posting date is required',
            severity: 'critical',
            fixSuggestion: 'Add posting date or use fallback date logic'
          };
        }
        
        const parsedDate = parseExcelDate(value, 'posting_date');
        if (!parsedDate) {
          return {
            row: index + 1,
            field: 'posting_date',
            value,
            error: 'Invalid date format',
            severity: 'high',
            fixSuggestion: 'Ensure date is in proper Excel format (YYYY-MM-DD or Excel date number)'
          };
        }

        // Check for future dates (suspicious)
        const date = new Date(parsedDate);
        const now = new Date();
        if (date > now) {
          return {
            row: index + 1,
            field: 'posting_date',
            value,
            error: 'Posting date is in the future',
            severity: 'medium',
            fixSuggestion: 'Verify that the posting date is correct'
          };
        }

        return null;
      }
    },
    {
      field: 'item_code',
      required: false, // Some records may not have item codes
      type: 'string',
      maxLength: 50
    },
    {
      field: 'quantity',
      required: false,
      type: 'number',
      min: 0,
      customValidator: (value, record, index) => {
        if (value !== null && value !== undefined && value !== '') {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            return {
              row: index + 1,
              field: 'quantity',
              value,
              error: 'Quantity must be a valid number',
              severity: 'high',
              fixSuggestion: 'Convert to numeric format or remove non-numeric characters'
            };
          }
          if (numValue < 0) {
            return {
              row: index + 1,
              field: 'quantity',
              value,
              error: 'Quantity cannot be negative',
              severity: 'medium',
              fixSuggestion: 'Verify quantity value or use absolute value'
            };
          }
        }
        return null;
      }
    },
    {
      field: 'amount',
      required: false,
      type: 'number',
      customValidator: (value, record, index) => {
        if (value !== null && value !== undefined && value !== '') {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            return {
              row: index + 1,
              field: 'amount',
              value,
              error: 'Amount must be a valid number',
              severity: 'high',
              fixSuggestion: 'Convert to numeric format, remove currency symbols or commas'
            };
          }
          if (Math.abs(numValue) > 10000000) {
            return {
              row: index + 1,
              field: 'amount',
              value,
              error: 'Amount seems unusually large',
              severity: 'low',
              fixSuggestion: 'Verify that the amount is correct'
            };
          }
        }
        return null;
      }
    },
    {
      field: 'salesperson_code',
      required: false,
      type: 'string',
      maxLength: 20,
      pattern: /^[A-Z0-9_-]*$/i
    }
  ];

  // Validate entire dataset
  async validateDataset(rawData: any[]): Promise<ValidationResult> {
    console.log(`🔍 Starting comprehensive validation for ${rawData.length} records...`);
    
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let validRecords = 0;

    // Transform data first to validate against expected schema
    const transformedData = this.transformDataForValidation(rawData);

    // Validate each record
    for (let i = 0; i < transformedData.length; i++) {
      const record = transformedData[i];
      const recordValidation = this.validateRecord(record, i);
      
      errors.push(...recordValidation.errors);
      warnings.push(...recordValidation.warnings);
      
      if (recordValidation.errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0) {
        validRecords++;
      }
    }

    // Check for duplicates
    const duplicateAnalysis = this.analyzeDuplicates(transformedData);
    errors.push(...duplicateAnalysis.errors);
    warnings.push(...duplicateAnalysis.warnings);

    // Calculate quality metrics
    const qualityMetrics = this.calculateQualityMetrics(transformedData, errors, warnings);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(errors, warnings, qualityMetrics);

    const qualityScore = this.calculateQualityScore(transformedData.length, errors, warnings);

    console.log(`✅ Validation completed: ${validRecords}/${rawData.length} valid records`);
    console.log(`📊 Quality score: ${qualityScore}/100`);
    console.log(`🚨 Errors: ${errors.length}, Warnings: ${warnings.length}`);

    return {
      isValid: errors.filter(e => e.severity === 'critical').length === 0,
      errors,
      warnings,
      qualityScore,
      recommendations
    };
  }

  // Validate individual record
  private validateRecord(record: any, index: number): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of this.validationRules) {
      const value = record[rule.field];

      // Required field check
      if (rule.required && (value === null || value === undefined || value === '')) {
        errors.push({
          row: index + 1,
          field: rule.field,
          value,
          error: `Required field '${rule.field}' is missing or empty`,
          severity: 'critical',
          fixSuggestion: `Provide a value for ${rule.field}`
        });
        continue;
      }

      // Skip further validation if field is empty and not required
      if (!rule.required && (value === null || value === undefined || value === '')) {
        continue;
      }

      // Type validation
      const typeError = this.validateFieldType(value, rule, index);
      if (typeError) {
        errors.push(typeError);
        continue;
      }

      // Custom validation
      if (rule.customValidator) {
        const customError = rule.customValidator(value, record, index);
        if (customError) {
          errors.push(customError);
        }
      }

      // String length validation
      if (rule.type === 'string' && typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push({
            row: index + 1,
            field: rule.field,
            value,
            error: `${rule.field} is too short (minimum ${rule.minLength} characters)`,
            severity: 'medium',
            fixSuggestion: `Extend ${rule.field} to at least ${rule.minLength} characters`
          });
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          warnings.push({
            row: index + 1,
            field: rule.field,
            value,
            warning: `${rule.field} is longer than expected (${value.length} > ${rule.maxLength})`,
            impact: 'May be truncated in database'
          });
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          errors.push({
            row: index + 1,
            field: rule.field,
            value,
            error: `${rule.field} does not match expected format`,
            severity: 'medium',
            fixSuggestion: `Ensure ${rule.field} matches pattern: ${rule.pattern}`
          });
        }
      }

      // Number range validation
      if (rule.type === 'number' && typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push({
            row: index + 1,
            field: rule.field,
            value,
            error: `${rule.field} is below minimum value (${value} < ${rule.min})`,
            severity: 'medium'
          });
        }
        if (rule.max !== undefined && value > rule.max) {
          warnings.push({
            row: index + 1,
            field: rule.field,
            value,
            warning: `${rule.field} is above maximum value (${value} > ${rule.max})`,
            impact: 'May indicate data entry error'
          });
        }
      }
    }

    return { errors, warnings };
  }

  // Validate field type
  private validateFieldType(value: any, rule: FieldValidationRule, index: number): ValidationError | null {
    if (value === null || value === undefined || value === '') return null;

    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          return {
            row: index + 1,
            field: rule.field,
            value,
            error: `${rule.field} must be a string`,
            severity: 'high',
            fixSuggestion: `Convert ${rule.field} to string format`
          };
        }
        break;

      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          return {
            row: index + 1,
            field: rule.field,
            value,
            error: `${rule.field} must be a valid number`,
            severity: 'high',
            fixSuggestion: `Convert ${rule.field} to numeric format`
          };
        }
        break;

      case 'date':
        const parsedDate = parseExcelDate(value, rule.field);
        if (!parsedDate) {
          return {
            row: index + 1,
            field: rule.field,
            value,
            error: `${rule.field} is not a valid date`,
            severity: 'high',
            fixSuggestion: `Ensure ${rule.field} is in proper date format`
          };
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean' && !['yes', 'no', 'true', 'false', '1', '0'].includes(String(value).toLowerCase())) {
          return {
            row: index + 1,
            field: rule.field,
            value,
            error: `${rule.field} must be a valid boolean value`,
            severity: 'medium',
            fixSuggestion: `Use Yes/No, True/False, or 1/0 for ${rule.field}`
          };
        }
        break;
    }

    return null;
  }

  // Analyze duplicates
  private analyzeDuplicates(data: any[]): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for potential unique constraint violations
    const duplicateMap = new Map<string, number[]>();

    data.forEach((record, index) => {
      // Create key based on fields used in unique constraint
      const key = `${record.document_no || ''}_${record.item_code || ''}_${record.posting_date || ''}_${record.customer_code || ''}`;
      
      if (!duplicateMap.has(key)) {
        duplicateMap.set(key, []);
      }
      duplicateMap.get(key)!.push(index);
    });

    // Identify duplicates
    for (const [key, indices] of duplicateMap.entries()) {
      if (indices.length > 1) {
        const [document_no, item_code, posting_date, customer_code] = key.split('_');
        
        indices.forEach(index => {
          errors.push({
            row: index + 1,
            field: 'duplicate_record',
            value: { document_no, item_code, posting_date, customer_code },
            error: `Duplicate record detected (document_no: ${document_no}, item_code: ${item_code})`,
            severity: 'high',
            fixSuggestion: 'Remove duplicate records or modify unique constraint fields'
          });
        });
      }
    }

    return { errors, warnings };
  }

  // Calculate quality metrics
  private calculateQualityMetrics(data: any[], errors: ValidationError[], warnings: ValidationWarning[]): DataQualityMetrics {
    const totalRecords = data.length;
    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const highErrors = errors.filter(e => e.severity === 'high').length;
    const invalidRecords = new Set(errors.map(e => e.row)).size;
    const validRecords = totalRecords - invalidRecords;

    // Calculate duplicates
    const duplicateErrors = errors.filter(e => e.field === 'duplicate_record');
    const duplicateRecords = duplicateErrors.length;

    // Calculate incomplete records (missing required fields)
    const requiredFields = this.validationRules.filter(r => r.required).map(r => r.field);
    let incompleteRecords = 0;
    
    data.forEach(record => {
      const missingFields = requiredFields.filter(field => 
        record[field] === null || record[field] === undefined || record[field] === ''
      );
      if (missingFields.length > 0) incompleteRecords++;
    });

    // Calculate suspicious records (warnings)
    const suspiciousRecords = new Set(warnings.map(w => w.row)).size;

    // Calculate data completeness (percentage of non-null values)
    const allFields = Object.keys(SALES_HEADER_MAPPING);
    const totalFields = allFields.length * totalRecords;
    let nonEmptyFields = 0;
    
    data.forEach(record => {
      allFields.forEach(field => {
        const dbField = SALES_HEADER_MAPPING[field];
        if (record[dbField] !== null && record[dbField] !== undefined && record[dbField] !== '') {
          nonEmptyFields++;
        }
      });
    });

    const dataCompleteness = Math.round((nonEmptyFields / totalFields) * 100);

    // Calculate data consistency (percentage of records without critical errors)
    const dataConsistency = Math.round(((totalRecords - criticalErrors) / totalRecords) * 100);

    // Estimate memory requirement (rough calculation)
    const avgRecordSize = JSON.stringify(data[0] || {}).length;
    const memoryRequirementMB = Math.round((avgRecordSize * totalRecords) / 1024 / 1024 * 2); // Factor of 2 for processing overhead

    // Estimate processing time based on record count and complexity
    const baseTimePerRecord = 0.05; // 50ms per record base
    const errorComplexityFactor = 1 + (errors.length / totalRecords);
    const estimatedProcessingTime = Math.round(totalRecords * baseTimePerRecord * errorComplexityFactor);

    return {
      totalRecords,
      validRecords,
      invalidRecords,
      duplicateRecords,
      incompleteRecords,
      suspiciousRecords,
      dataCompleteness,
      dataConsistency,
      expectedConstraintViolations: duplicateRecords,
      memoryRequirementMB,
      estimatedProcessingTime
    };
  }

  // Generate recommendations
  private generateRecommendations(
    errors: ValidationError[], 
    warnings: ValidationWarning[], 
    metrics: DataQualityMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Critical error recommendations
    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    if (criticalErrors > 0) {
      recommendations.push(`Fix ${criticalErrors} critical errors before proceeding with upload`);
    }

    // Duplicate recommendations
    if (metrics.duplicateRecords > 0) {
      recommendations.push(`Remove or handle ${metrics.duplicateRecords} duplicate records to prevent constraint violations`);
    }

    // Data quality recommendations
    if (metrics.dataConsistency < 90) {
      recommendations.push('Improve data consistency by fixing validation errors');
    }

    if (metrics.dataCompleteness < 80) {
      recommendations.push('Consider filling missing data fields to improve data completeness');
    }

    // Performance recommendations
    if (metrics.memoryRequirementMB > 100) {
      recommendations.push('Consider processing data in smaller chunks due to high memory requirements');
    }

    if (metrics.estimatedProcessingTime > 300) {
      recommendations.push('Use optimized batch processing for large dataset (estimated processing time > 5 minutes)');
    }

    // Error pattern recommendations
    const timeoutRisk = errors.filter(e => e.field === 'amount' || e.field === 'quantity').length;
    if (timeoutRisk > metrics.totalRecords * 0.1) {
      recommendations.push('High risk of numeric conversion errors - consider pre-processing numeric fields');
    }

    const dateErrors = errors.filter(e => e.field === 'posting_date').length;
    if (dateErrors > metrics.totalRecords * 0.05) {
      recommendations.push('Date format issues detected - consider standardizing date formats before upload');
    }

    return recommendations;
  }

  // Calculate overall quality score
  private calculateQualityScore(totalRecords: number, errors: ValidationError[], warnings: ValidationWarning[]): number {
    if (totalRecords === 0) return 0;

    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const highErrors = errors.filter(e => e.severity === 'high').length;
    const mediumErrors = errors.filter(e => e.severity === 'medium').length;
    const lowErrors = errors.filter(e => e.severity === 'low').length;

    // Weight different error types
    const errorScore = (
      (criticalErrors * 10) +
      (highErrors * 5) +
      (mediumErrors * 2) +
      (lowErrors * 1) +
      (warnings.length * 0.5)
    );

    const maxPossibleScore = totalRecords * 10; // Assume worst case: all critical errors
    const qualityScore = Math.max(0, Math.round(((maxPossibleScore - errorScore) / maxPossibleScore) * 100));

    return Math.min(100, qualityScore);
  }

  // Transform raw data using existing mapping logic
  private transformDataForValidation(rawData: any[]): any[] {
    return rawData.map(row => {
      const transformedRow: Record<string, any> = {};
      
      // Map Excel headers to database column names
      for (const [excelHeader, dbColumn] of Object.entries(SALES_HEADER_MAPPING)) {
        if (row[excelHeader] !== undefined) {
          transformedRow[dbColumn] = row[excelHeader];
        }
      }

      return transformedRow;
    });
  }

  // Get validation rules (for external use)
  getValidationRules(): FieldValidationRule[] {
    return [...this.validationRules];
  }

  // Add custom validation rule
  addValidationRule(rule: FieldValidationRule): void {
    this.validationRules.push(rule);
  }

  // Remove validation rule
  removeValidationRule(field: string): void {
    this.validationRules = this.validationRules.filter(rule => rule.field !== field);
  }
}

// Export singleton instance
export const dataValidationService = new DataValidationService();

// Utility functions
export const formatValidationError = (error: ValidationError): string => {
  const severityIcons: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵'
  };
  
  return `${severityIcons[error.severity]} Row ${error.row}: ${error.error}${error.fixSuggestion ? ` (Fix: ${error.fixSuggestion})` : ''}`;
};

export const formatValidationSummary = (result: ValidationResult): string => {
  const { errors, warnings, qualityScore } = result;
  const criticalErrors = errors.filter(e => e.severity === 'critical').length;
  
  return `Quality Score: ${qualityScore}/100 | Critical: ${criticalErrors}, Errors: ${errors.length}, Warnings: ${warnings.length}`;
};

export default dataValidationService;