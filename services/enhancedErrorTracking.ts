import { supabase } from '../lib/supabase';

export interface DetailedErrorLog {
  batchId: string;
  batchNumber: number;
  batchSize: number;
  recordsAttempted: number;
  recordsSucceeded: number;
  errorType: 'timeout' | 'constraint' | 'network' | 'validation' | 'memory' | 'unknown';
  errorCode?: string;
  errorMessage: string;
  errorStack?: string;
  retryAttempt: number;
  processingTimeMs: number;
  memoryUsageMB?: number;
  connectionPoolSize?: number;
  dataSample?: any;
  timestamp: Date;
  contextInfo?: {
    totalRecordsInUpload: number;
    uploadProgress: number;
    systemLoad?: number;
    consecutiveFailures: number;
  };
}

export interface PerformanceMetrics {
  uploadId: string;
  totalRecords: number;
  totalBatches: number;
  successfulBatches: number;
  failedBatches: number;
  totalRetries: number;
  averageBatchSize: number;
  averageProcessingTimeMs: number;
  peakMemoryUsageMB: number;
  totalTimeoutErrors: number;
  totalConstraintErrors: number;
  totalValidationErrors: number;
  batchSizeProgression: number[];
  errorHotspots: { recordIndex: number; errorType: string; frequency: number }[];
  resourceContention: boolean;
  startTime: Date;
  endTime?: Date;
}

export interface ResourceMonitor {
  connectionPoolUsage: number;
  activeConnections: number;
  memoryUsageMB: number;
  cpuLoad?: number;
  timestamp: Date;
}

class EnhancedErrorTracker {
  private currentUploadId: string = '';
  private errors: DetailedErrorLog[] = [];
  private metrics: Partial<PerformanceMetrics> = {};
  private resourceSnapshots: ResourceMonitor[] = [];
  private consecutiveFailures: number = 0;

  // Initialize tracking for a new upload session
  startUploadSession(totalRecords: number): string {
    this.currentUploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.errors = [];
    this.resourceSnapshots = [];
    this.consecutiveFailures = 0;
    
    this.metrics = {
      uploadId: this.currentUploadId,
      totalRecords,
      totalBatches: 0,
      successfulBatches: 0,
      failedBatches: 0,
      totalRetries: 0,
      batchSizeProgression: [],
      errorHotspots: [],
      resourceContention: false,
      startTime: new Date()
    };

    console.log(`🔍 Enhanced tracking started for upload: ${this.currentUploadId}`);
    return this.currentUploadId;
  }

  // Classify error types with enhanced detection
  private classifyError(error: any): 'timeout' | 'constraint' | 'network' | 'validation' | 'memory' | 'unknown' {
    if (!error) return 'unknown';
    
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';
    
    // Enhanced timeout detection
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('timed out') || 
        errorMessage.includes('time out') ||
        errorMessage.includes('request timeout') ||
        errorMessage.includes('connection timeout') ||
        errorMessage.includes('statement timeout') ||
        errorCode.includes('timeout') ||
        errorCode === 'pgrst301' ||
        errorCode === 'pgrst408') {
      return 'timeout';
    }

    // Enhanced constraint detection
    if (errorMessage.includes('duplicate key') ||
        errorMessage.includes('unique constraint') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('violates') ||
        errorMessage.includes('foreign key') ||
        errorCode === '23505' ||
        errorCode === '23503') {
      return 'constraint';
    }

    // Network error detection
    if (errorMessage.includes('network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('refused') ||
        errorMessage.includes('unreachable') ||
        errorMessage.includes('dns') ||
        errorCode.includes('net') ||
        errorCode.includes('conn')) {
      return 'network';
    }

    // Memory error detection
    if (errorMessage.includes('memory') ||
        errorMessage.includes('out of memory') ||
        errorMessage.includes('heap') ||
        errorMessage.includes('allocation') ||
        errorCode.includes('mem')) {
      return 'memory';
    }

    // Validation error detection
    if (errorMessage.includes('invalid') ||
        errorMessage.includes('validation') ||
        errorMessage.includes('not null') ||
        errorMessage.includes('check constraint') ||
        errorMessage.includes('data type') ||
        errorCode.includes('22') || // PostgreSQL data exception codes
        errorCode.includes('23001')) { // not null violation
      return 'validation';
    }

    return 'unknown';
  }

  // Log detailed batch error
  logBatchError(
    batchNumber: number,
    batchSize: number,
    recordsAttempted: number,
    error: any,
    retryAttempt: number,
    processingTimeMs: number,
    dataSample?: any
  ) {
    const errorType = this.classifyError(error);
    this.consecutiveFailures++;

    const errorLog: DetailedErrorLog = {
      batchId: `${this.currentUploadId}_batch_${batchNumber}`,
      batchNumber,
      batchSize,
      recordsAttempted,
      recordsSucceeded: 0,
      errorType,
      errorCode: error?.code,
      errorMessage: error?.message || 'Unknown error',
      errorStack: error?.stack,
      retryAttempt,
      processingTimeMs,
      memoryUsageMB: this.getMemoryUsage(),
      dataSample: dataSample ? this.sanitizeDataSample(dataSample) : undefined,
      timestamp: new Date(),
      contextInfo: {
        totalRecordsInUpload: this.metrics.totalRecords || 0,
        uploadProgress: Math.round(((batchNumber - 1) * batchSize / (this.metrics.totalRecords || 1)) * 100),
        consecutiveFailures: this.consecutiveFailures
      }
    };

    this.errors.push(errorLog);
    
    // Update metrics
    this.metrics.failedBatches = (this.metrics.failedBatches || 0) + 1;
    this.metrics.totalRetries = (this.metrics.totalRetries || 0) + retryAttempt;

    // Detect resource contention patterns
    if (this.consecutiveFailures >= 3 && errorType === 'timeout') {
      this.metrics.resourceContention = true;
    }

    console.error(`🚨 Batch ${batchNumber} error (${errorType}):`, {
      batchSize,
      retryAttempt,
      processingTimeMs,
      consecutiveFailures: this.consecutiveFailures,
      errorMessage: error?.message
    });

    return errorLog;
  }

  // Log successful batch
  logBatchSuccess(
    batchNumber: number,
    batchSize: number,
    recordsProcessed: number,
    processingTimeMs: number
  ) {
    this.consecutiveFailures = 0; // Reset consecutive failures
    
    // Update metrics
    this.metrics.successfulBatches = (this.metrics.successfulBatches || 0) + 1;
    this.metrics.totalBatches = (this.metrics.totalBatches || 0) + 1;
    this.metrics.batchSizeProgression?.push(batchSize);

    // Update averages
    const totalBatches = this.metrics.totalBatches;
    const currentAvgTime = this.metrics.averageProcessingTimeMs || 0;
    this.metrics.averageProcessingTimeMs = ((currentAvgTime * (totalBatches - 1)) + processingTimeMs) / totalBatches;

    const currentAvgSize = this.metrics.averageBatchSize || 0;
    this.metrics.averageBatchSize = ((currentAvgSize * (totalBatches - 1)) + batchSize) / totalBatches;

    console.log(`✅ Batch ${batchNumber} success:`, {
      batchSize,
      recordsProcessed,
      processingTimeMs,
      averageTime: Math.round(this.metrics.averageProcessingTimeMs || 0)
    });
  }

  // Capture resource snapshot
  captureResourceSnapshot() {
    const snapshot: ResourceMonitor = {
      connectionPoolUsage: 0, // We'll implement this based on Supabase monitoring
      activeConnections: 0,
      memoryUsageMB: this.getMemoryUsage(),
      timestamp: new Date()
    };

    this.resourceSnapshots.push(snapshot);
    
    // Keep only last 100 snapshots
    if (this.resourceSnapshots.length > 100) {
      this.resourceSnapshots = this.resourceSnapshots.slice(-100);
    }

    return snapshot;
  }

  // Detect error patterns and hotspots
  analyzeErrorPatterns(): {
    timeoutClusters: number[];
    constraintHotspots: number[];
    memoryPressurePoints: number[];
    recommendedActions: string[];
  } {
    const timeoutClusters: number[] = [];
    const constraintHotspots: number[] = [];
    const memoryPressurePoints: number[] = [];
    const recommendedActions: string[] = [];

    // Analyze timeout patterns
    const timeoutErrors = this.errors.filter(e => e.errorType === 'timeout');
    if (timeoutErrors.length > 5) {
      recommendedActions.push('Implement more aggressive batch size reduction for timeout-prone data sections');
      
      // Find timeout clusters
      timeoutErrors.forEach(error => {
        if (error.contextInfo) {
          timeoutClusters.push(error.contextInfo.uploadProgress);
        }
      });
    }

    // Analyze constraint violations
    const constraintErrors = this.errors.filter(e => e.errorType === 'constraint');
    if (constraintErrors.length > 3) {
      recommendedActions.push('Review data deduplication strategy and unique constraints');
      
      constraintErrors.forEach(error => {
        if (error.contextInfo) {
          constraintHotspots.push(error.contextInfo.uploadProgress);
        }
      });
    }

    // Analyze memory issues
    const memoryErrors = this.errors.filter(e => e.errorType === 'memory' || (e.memoryUsageMB && e.memoryUsageMB > 500));
    if (memoryErrors.length > 0) {
      recommendedActions.push('Implement streaming data processing to reduce memory footprint');
      
      memoryErrors.forEach(error => {
        if (error.contextInfo) {
          memoryPressurePoints.push(error.contextInfo.uploadProgress);
        }
      });
    }

    // Resource contention detection
    if (this.metrics.resourceContention) {
      recommendedActions.push('Implement connection pool optimization and circuit breaker pattern');
    }

    return {
      timeoutClusters,
      constraintHotspots,
      memoryPressurePoints,
      recommendedActions
    };
  }

  // Finalize upload session and save comprehensive log
  async finalizeUploadSession(status: 'success' | 'partial' | 'failed') {
    this.metrics.endTime = new Date();
    const analysis = this.analyzeErrorPatterns();

    // Calculate final metrics
    this.metrics.peakMemoryUsageMB = Math.max(...this.resourceSnapshots.map(r => r.memoryUsageMB));
    this.metrics.totalTimeoutErrors = this.errors.filter(e => e.errorType === 'timeout').length;
    this.metrics.totalConstraintErrors = this.errors.filter(e => e.errorType === 'constraint').length;
    this.metrics.totalValidationErrors = this.errors.filter(e => e.errorType === 'validation').length;

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const logData = {
        sync_type: 'salesdata_upload_enhanced_diagnostics',
        status,
        records_processed: this.metrics.totalRecords,
        records_inserted: (this.metrics.successfulBatches || 0) * (this.metrics.averageBatchSize || 0),
        records_updated: 0,
        errors: this.errors.length > 0 ? [
          {
            enhanced_diagnostics: true,
            upload_id: this.currentUploadId,
            total_errors: this.errors.length,
            error_breakdown: {
              timeout: this.metrics.totalTimeoutErrors,
              constraint: this.metrics.totalConstraintErrors,
              validation: this.metrics.totalValidationErrors,
              network: this.errors.filter(e => e.errorType === 'network').length,
              memory: this.errors.filter(e => e.errorType === 'memory').length,
              unknown: this.errors.filter(e => e.errorType === 'unknown').length
            },
            performance_metrics: this.metrics,
            error_analysis: analysis,
            detailed_errors: this.errors.slice(0, 20) // Store first 20 detailed errors
          }
        ] : null,
        sync_duration_ms: this.metrics.endTime ? 
          this.metrics.endTime.getTime() - this.metrics.startTime.getTime() : 0,
        synced_by: user?.id || null
      };

      const { error } = await supabase
        .from('sync_log')
        .insert(logData);

      if (error) {
        console.error('Failed to save enhanced diagnostics:', error);
      } else {
        console.log(`✅ Enhanced diagnostics saved for upload: ${this.currentUploadId}`);
      }

    } catch (error) {
      console.error('Error saving enhanced diagnostics:', error);
    }

    return {
      uploadId: this.currentUploadId,
      finalMetrics: this.metrics,
      analysis,
      detailedErrors: this.errors
    };
  }

  // Utility functions
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    }
    return 0;
  }

  private sanitizeDataSample(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = Array.isArray(data) ? data.slice(0, 2) : { ...data };
    
    // Remove potentially sensitive fields
    const sensitiveFields = ['password', 'token', 'key', 'secret'];
    if (typeof sanitized === 'object') {
      Object.keys(sanitized).forEach(key => {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          sanitized[key] = '[REDACTED]';
        }
      });
    }
    
    return sanitized;
  }

  // Get current metrics (for real-time monitoring)
  getCurrentMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  // Get error summary for UI display
  getErrorSummary(): {
    totalErrors: number;
    errorTypes: Record<string, number>;
    consecutiveFailures: number;
    resourceContention: boolean;
  } {
    const errorTypes: Record<string, number> = {};
    this.errors.forEach(error => {
      errorTypes[error.errorType] = (errorTypes[error.errorType] || 0) + 1;
    });

    return {
      totalErrors: this.errors.length,
      errorTypes,
      consecutiveFailures: this.consecutiveFailures,
      resourceContention: this.metrics.resourceContention || false
    };
  }
}

// Export singleton instance
export const enhancedErrorTracker = new EnhancedErrorTracker();

// Utility functions
export const createBatchId = (uploadId: string, batchNumber: number): string => 
  `${uploadId}_batch_${batchNumber}`;

export const formatErrorSummary = (summary: ReturnType<typeof enhancedErrorTracker.getErrorSummary>): string => {
  const { totalErrors, errorTypes, consecutiveFailures, resourceContention } = summary;
  
  if (totalErrors === 0) return '✅ No errors detected';
  
  const typesList = Object.entries(errorTypes)
    .map(([type, count]) => `${type}: ${count}`)
    .join(', ');
  
  return `🚨 ${totalErrors} errors (${typesList})${consecutiveFailures > 3 ? ` | ${consecutiveFailures} consecutive failures` : ''}${resourceContention ? ' | Resource contention detected' : ''}`;
};

export default enhancedErrorTracker;