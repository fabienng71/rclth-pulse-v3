import { ConnectionMetrics } from './connectionMonitor';

export interface BatchReductionStrategy {
  name: string;
  description: string;
  stages: BatchReductionStage[];
  fallbackToIndividual: boolean;
  maxReductionAttempts: number;
}

export interface BatchReductionStage {
  stage: number;
  batchSize: number;
  triggerCondition: 'timeout' | 'constraint' | 'memory' | 'consecutive_failures';
  reductionPercentage: number;
  delayMultiplier: number;
  retryLimit: number;
  description: string;
}

export interface BatchReductionState {
  currentStage: number;
  currentBatchSize: number;
  originalBatchSize: number;
  totalReductions: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  timeoutCount: number;
  constraintErrorCount: number;
  memoryErrorCount: number;
  lastReductionReason: string;
  reductionHistory: ReductionEvent[];
}

export interface ReductionEvent {
  timestamp: Date;
  fromSize: number;
  toSize: number;
  reason: string;
  stage: number;
}

export interface BatchDecision {
  batchSize: number;
  delay: number;
  shouldRetry: boolean;
  shouldUseIndividualRecords: boolean;
  reasoning: string;
  confidence: 'low' | 'medium' | 'high';
  expectedSuccessRate: number;
}

class ProgressiveBatchReduction {
  private strategies: Record<string, BatchReductionStrategy> = {
    aggressive: {
      name: 'Aggressive Reduction',
      description: 'Fast reduction for timeout-heavy scenarios like August data',
      fallbackToIndividual: true,
      maxReductionAttempts: 8,
      stages: [
        {
          stage: 1,
          batchSize: 50,
          triggerCondition: 'timeout',
          reductionPercentage: 50, // 50 -> 25
          delayMultiplier: 1.5,
          retryLimit: 2,
          description: 'Initial timeout - reduce by 50%'
        },
        {
          stage: 2,
          batchSize: 25,
          triggerCondition: 'timeout',
          reductionPercentage: 60, // 25 -> 10
          delayMultiplier: 2.0,
          retryLimit: 3,
          description: 'Second timeout - aggressive reduction'
        },
        {
          stage: 3,
          batchSize: 10,
          triggerCondition: 'timeout',
          reductionPercentage: 50, // 10 -> 5
          delayMultiplier: 2.5,
          retryLimit: 4,
          description: 'Third timeout - conservative batch size'
        },
        {
          stage: 4,
          batchSize: 5,
          triggerCondition: 'timeout',
          reductionPercentage: 80, // 5 -> 1
          delayMultiplier: 3.0,
          retryLimit: 5,
          description: 'Final timeout - individual record processing'
        },
        {
          stage: 5,
          batchSize: 1,
          triggerCondition: 'timeout',
          reductionPercentage: 0, // Stay at 1
          delayMultiplier: 4.0,
          retryLimit: 10,
          description: 'Individual record processing with extended retries'
        }
      ]
    },
    conservative: {
      name: 'Conservative Reduction',
      description: 'Gradual reduction for stable environments',
      fallbackToIndividual: false,
      maxReductionAttempts: 5,
      stages: [
        {
          stage: 1,
          batchSize: 50,
          triggerCondition: 'timeout',
          reductionPercentage: 30, // 50 -> 35
          delayMultiplier: 1.2,
          retryLimit: 2,
          description: 'Initial timeout - minor reduction'
        },
        {
          stage: 2,
          batchSize: 35,
          triggerCondition: 'timeout',
          reductionPercentage: 40, // 35 -> 21
          delayMultiplier: 1.5,
          retryLimit: 3,
          description: 'Second timeout - moderate reduction'
        },
        {
          stage: 3,
          batchSize: 20,
          triggerCondition: 'timeout',
          reductionPercentage: 50, // 20 -> 10
          delayMultiplier: 2.0,
          retryLimit: 4,
          description: 'Third timeout - significant reduction'
        },
        {
          stage: 4,
          batchSize: 10,
          triggerCondition: 'timeout',
          reductionPercentage: 50, // 10 -> 5
          delayMultiplier: 2.5,
          retryLimit: 5,
          description: 'Final timeout - minimum batch size'
        },
        {
          stage: 5,
          batchSize: 5,
          triggerCondition: 'timeout',
          reductionPercentage: 0, // Stay at 5
          delayMultiplier: 3.0,
          retryLimit: 6,
          description: 'Minimum batch size with extended delays'
        }
      ]
    },
    constraint_focused: {
      name: 'Constraint Error Focused',
      description: 'Optimized for duplicate/constraint violation handling',
      fallbackToIndividual: true,
      maxReductionAttempts: 6,
      stages: [
        {
          stage: 1,
          batchSize: 50,
          triggerCondition: 'constraint',
          reductionPercentage: 70, // 50 -> 15 (small batches reduce constraint conflicts)
          delayMultiplier: 1.0,
          retryLimit: 1,
          description: 'Constraint error - dramatic reduction to minimize conflicts'
        },
        {
          stage: 2,
          batchSize: 15,
          triggerCondition: 'constraint',
          reductionPercentage: 67, // 15 -> 5
          delayMultiplier: 1.2,
          retryLimit: 2,
          description: 'Second constraint error - small batches'
        },
        {
          stage: 3,
          batchSize: 5,
          triggerCondition: 'constraint',
          reductionPercentage: 80, // 5 -> 1
          delayMultiplier: 1.5,
          retryLimit: 3,
          description: 'Persistent constraint errors - individual processing'
        },
        {
          stage: 4,
          batchSize: 1,
          triggerCondition: 'constraint',
          reductionPercentage: 0, // Stay at 1
          delayMultiplier: 2.0,
          retryLimit: 8,
          description: 'Individual record processing for constraint resolution'
        }
      ]
    }
  };

  private state: BatchReductionState = this.initializeState(50);

  // Initialize state for new upload session
  initializeState(initialBatchSize: number): BatchReductionState {
    return {
      currentStage: 0,
      currentBatchSize: initialBatchSize,
      originalBatchSize: initialBatchSize,
      totalReductions: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      timeoutCount: 0,
      constraintErrorCount: 0,
      memoryErrorCount: 0,
      lastReductionReason: '',
      reductionHistory: []
    };
  }

  // Reset state for new upload
  reset(initialBatchSize: number = 50): void {
    this.state = this.initializeState(initialBatchSize);
    console.log(`🔄 Progressive batch reduction reset - starting with size ${initialBatchSize}`);
  }

  // Make decision for next batch based on previous results and current conditions
  makeDecision(
    lastResult: {
      success: boolean;
      error?: any;
      processingTimeMs: number;
      retryCount: number;
    },
    connectionMetrics?: Partial<ConnectionMetrics>,
    remainingRecords: number = 1000
  ): BatchDecision {
    const strategy = this.selectStrategy(lastResult, connectionMetrics);
    
    if (lastResult.success) {
      return this.handleSuccess(lastResult, strategy, remainingRecords);
    } else {
      return this.handleFailure(lastResult, strategy, remainingRecords, connectionMetrics);
    }
  }

  // Select appropriate strategy based on error patterns and conditions
  private selectStrategy(
    lastResult: { success: boolean; error?: any },
    connectionMetrics?: Partial<ConnectionMetrics>
  ): string {
    // High constraint error rate - use constraint-focused strategy
    if (this.state.constraintErrorCount > this.state.timeoutCount * 2) {
      return 'constraint_focused';
    }

    // High connection pressure - use conservative approach
    if (connectionMetrics?.connectionHealth === 'degraded' || 
        connectionMetrics?.errorRate && connectionMetrics.errorRate > 20) {
      return 'conservative';
    }

    // Timeout-heavy scenario (like August data issues) - use aggressive
    if (this.state.timeoutCount > 3 || this.state.consecutiveFailures > 2) {
      return 'aggressive';
    }

    // Default to conservative for stable conditions
    return 'conservative';
  }

  // Handle successful batch
  private handleSuccess(
    lastResult: { success: boolean; processingTimeMs: number },
    strategyName: string,
    remainingRecords: number
  ): BatchDecision {
    this.state.consecutiveFailures = 0;
    this.state.consecutiveSuccesses++;

    let newBatchSize = this.state.currentBatchSize;
    let shouldIncrease = false;

    // Consider increasing batch size after sustained success
    if (this.state.consecutiveSuccesses >= 3 && lastResult.processingTimeMs < 15000) {
      // Only increase if we're not at original size and performance is good
      if (this.state.currentBatchSize < this.state.originalBatchSize) {
        const increasePercentage = 0.2; // 20% increase
        newBatchSize = Math.min(
          this.state.originalBatchSize,
          Math.ceil(this.state.currentBatchSize * (1 + increasePercentage))
        );
        shouldIncrease = true;
        this.state.consecutiveSuccesses = 0; // Reset counter
      }
    }

    // Don't increase if we're close to the end of processing
    if (remainingRecords < newBatchSize * 3) {
      newBatchSize = Math.min(newBatchSize, Math.ceil(remainingRecords / 2));
    }

    if (shouldIncrease) {
      console.log(`📈 Increasing batch size from ${this.state.currentBatchSize} to ${newBatchSize} after ${this.state.consecutiveSuccesses} successes`);
    }

    this.state.currentBatchSize = newBatchSize;

    return {
      batchSize: newBatchSize,
      delay: 200, // Standard delay for successful processing
      shouldRetry: false,
      shouldUseIndividualRecords: false,
      reasoning: shouldIncrease ? 
        `Increased batch size after sustained success (${this.state.consecutiveSuccesses} consecutive successes)` :
        'Maintaining current batch size after success',
      confidence: 'high',
      expectedSuccessRate: 85
    };
  }

  // Handle failed batch
  private handleFailure(
    lastResult: { success: boolean; error?: any; processingTimeMs: number; retryCount: number },
    strategyName: string,
    remainingRecords: number,
    connectionMetrics?: Partial<ConnectionMetrics>
  ): BatchDecision {
    this.state.consecutiveSuccesses = 0;
    this.state.consecutiveFailures++;

    // Classify error type
    const errorType = this.classifyError(lastResult.error);
    this.updateErrorCounts(errorType);

    const strategy = this.strategies[strategyName];
    const currentStage = Math.min(this.state.currentStage, strategy.stages.length - 1);
    const stageConfig = strategy.stages[currentStage];

    // Determine if we should reduce batch size
    const shouldReduce = this.shouldReduceBatchSize(errorType, stageConfig, lastResult.retryCount);
    
    if (shouldReduce && this.state.totalReductions < strategy.maxReductionAttempts) {
      return this.performBatchReduction(strategy, errorType, remainingRecords);
    } else {
      // No reduction, just retry with current settings or give up
      return this.handleNoReduction(strategy, lastResult.retryCount, errorType, connectionMetrics);
    }
  }

  // Classify error for appropriate handling
  private classifyError(error: any): 'timeout' | 'constraint' | 'memory' | 'network' | 'unknown' {
    if (!error) return 'unknown';

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';

    if (errorMessage.includes('timeout') || errorCode === 'pgrst301') return 'timeout';
    if (errorMessage.includes('duplicate') || errorMessage.includes('constraint') || errorCode === '23505') return 'constraint';
    if (errorMessage.includes('memory') || errorMessage.includes('heap')) return 'memory';
    if (errorMessage.includes('network') || errorMessage.includes('connection')) return 'network';

    return 'unknown';
  }

  // Update error counts for strategy selection
  private updateErrorCounts(errorType: string): void {
    switch (errorType) {
      case 'timeout':
        this.state.timeoutCount++;
        break;
      case 'constraint':
        this.state.constraintErrorCount++;
        break;
      case 'memory':
        this.state.memoryErrorCount++;
        break;
    }
  }

  // Determine if batch size should be reduced
  private shouldReduceBatchSize(
    errorType: string,
    stageConfig: BatchReductionStage,
    retryCount: number
  ): boolean {
    // Always reduce on first occurrence of target error type
    if (errorType === stageConfig.triggerCondition) return true;

    // Reduce after max retries for any error type
    if (retryCount >= stageConfig.retryLimit) return true;

    // Reduce after consecutive failures regardless of type
    if (this.state.consecutiveFailures >= 3) return true;

    return false;
  }

  // Perform batch size reduction
  private performBatchReduction(
    strategy: BatchReductionStrategy,
    errorType: string,
    remainingRecords: number
  ): BatchDecision {
    const oldSize = this.state.currentBatchSize;
    
    // Move to next stage
    this.state.currentStage = Math.min(this.state.currentStage + 1, strategy.stages.length - 1);
    const stageConfig = strategy.stages[this.state.currentStage];

    // Calculate new batch size
    let newSize: number;
    if (stageConfig.reductionPercentage === 0) {
      // No further reduction - stay at current size
      newSize = this.state.currentBatchSize;
    } else {
      const reductionAmount = Math.floor(this.state.currentBatchSize * (stageConfig.reductionPercentage / 100));
      newSize = Math.max(1, this.state.currentBatchSize - reductionAmount);
    }

    // Ensure we don't go below stage minimum
    newSize = Math.max(newSize, stageConfig.batchSize);

    // Don't use batch size larger than remaining records
    newSize = Math.min(newSize, remainingRecords);

    // Record the reduction
    this.state.reductionHistory.push({
      timestamp: new Date(),
      fromSize: oldSize,
      toSize: newSize,
      reason: `${errorType} error - ${stageConfig.description}`,
      stage: this.state.currentStage
    });

    this.state.currentBatchSize = newSize;
    this.state.totalReductions++;
    this.state.lastReductionReason = `${errorType} error at stage ${this.state.currentStage}`;

    console.log(`📉 Batch size reduced: ${oldSize} → ${newSize} (${stageConfig.description})`);

    // Check if we should switch to individual record processing
    const shouldUseIndividual = strategy.fallbackToIndividual && newSize === 1;

    return {
      batchSize: newSize,
      delay: Math.round(200 * stageConfig.delayMultiplier),
      shouldRetry: true,
      shouldUseIndividualRecords: shouldUseIndividual,
      reasoning: `Reduced batch size due to ${errorType} error. ${stageConfig.description}`,
      confidence: newSize > 5 ? 'medium' : 'low',
      expectedSuccessRate: this.calculateExpectedSuccessRate(newSize, errorType, this.state.currentStage)
    };
  }

  // Handle case where no reduction is performed
  private handleNoReduction(
    strategy: BatchReductionStrategy,
    retryCount: number,
    errorType: string,
    connectionMetrics?: Partial<ConnectionMetrics>
  ): BatchDecision {
    const currentStage = Math.min(this.state.currentStage, strategy.stages.length - 1);
    const stageConfig = strategy.stages[currentStage];

    // If we've hit max reductions, use individual processing if available
    if (this.state.totalReductions >= strategy.maxReductionAttempts && strategy.fallbackToIndividual) {
      console.log('🔄 Maximum reductions reached - switching to individual record processing');
      this.state.currentBatchSize = 1;
      
      return {
        batchSize: 1,
        delay: Math.round(500 * stageConfig.delayMultiplier),
        shouldRetry: true,
        shouldUseIndividualRecords: true,
        reasoning: 'Maximum reduction attempts reached - processing individual records',
        confidence: 'low',
        expectedSuccessRate: 30
      };
    }

    // Increase delay for retry without size reduction
    const delayMultiplier = Math.min(5.0, 1.5 + (retryCount * 0.5));
    
    return {
      batchSize: this.state.currentBatchSize,
      delay: Math.round(200 * delayMultiplier),
      shouldRetry: retryCount < stageConfig.retryLimit,
      shouldUseIndividualRecords: false,
      reasoning: `Retrying with same batch size (${this.state.currentBatchSize}) - attempt ${retryCount + 1}/${stageConfig.retryLimit}`,
      confidence: 'low',
      expectedSuccessRate: Math.max(10, 50 - (retryCount * 15))
    };
  }

  // Calculate expected success rate based on current conditions
  private calculateExpectedSuccessRate(
    batchSize: number,
    errorType: string,
    stage: number
  ): number {
    let baseRate = 70; // Base success rate

    // Adjust for batch size (smaller = higher success rate)
    if (batchSize <= 5) baseRate += 20;
    else if (batchSize <= 15) baseRate += 10;
    else if (batchSize > 50) baseRate -= 20;

    // Adjust for error type
    switch (errorType) {
      case 'timeout':
        baseRate -= stage * 5; // Timeouts get worse with retries
        break;
      case 'constraint':
        baseRate += batchSize > 10 ? -15 : 10; // Smaller batches better for constraints
        break;
      case 'memory':
        baseRate -= batchSize * 2; // Memory errors scale with batch size
        break;
    }

    return Math.max(5, Math.min(95, baseRate));
  }

  // Get current state for monitoring
  getCurrentState(): BatchReductionState {
    return { ...this.state };
  }

  // Get reduction summary for reporting
  getReductionSummary(): {
    originalSize: number;
    currentSize: number;
    totalReductions: number;
    reductionPercentage: number;
    majorMilestones: string[];
    effectiveness: 'high' | 'medium' | 'low';
  } {
    const reductionPercentage = Math.round(
      ((this.state.originalBatchSize - this.state.currentBatchSize) / this.state.originalBatchSize) * 100
    );

    const majorMilestones = this.state.reductionHistory
      .filter(event => event.fromSize - event.toSize >= 10 || event.toSize === 1)
      .map(event => `${event.fromSize}→${event.toSize}: ${event.reason}`);

    let effectiveness: 'high' | 'medium' | 'low' = 'medium';
    if (this.state.consecutiveSuccesses > 3) effectiveness = 'high';
    else if (this.state.consecutiveFailures > 5) effectiveness = 'low';

    return {
      originalSize: this.state.originalBatchSize,
      currentSize: this.state.currentBatchSize,
      totalReductions: this.state.totalReductions,
      reductionPercentage,
      majorMilestones,
      effectiveness
    };
  }

  // Get available strategies
  getStrategies(): Record<string, BatchReductionStrategy> {
    return { ...this.strategies };
  }

  // Add custom strategy
  addStrategy(name: string, strategy: BatchReductionStrategy): void {
    this.strategies[name] = strategy;
  }
}

// Export singleton instance
export const progressiveBatchReduction = new ProgressiveBatchReduction();

// Utility functions
export const formatReductionSummary = (summary: ReturnType<typeof progressiveBatchReduction.getReductionSummary>): string => {
  return `Batch Size: ${summary.originalSize}→${summary.currentSize} (${summary.reductionPercentage}% reduction), ${summary.totalReductions} adjustments, Effectiveness: ${summary.effectiveness}`;
};

export const getBatchSizeRecommendation = (
  errorCount: number,
  timeoutRatio: number,
  remainingRecords: number
): { batchSize: number; strategy: string; reasoning: string } => {
  if (timeoutRatio > 0.3) {
    return {
      batchSize: Math.min(10, remainingRecords),
      strategy: 'aggressive',
      reasoning: 'High timeout rate detected - using small batches'
    };
  }
  
  if (errorCount > remainingRecords * 0.2) {
    return {
      batchSize: Math.min(25, remainingRecords),
      strategy: 'constraint_focused',
      reasoning: 'High error rate - using constraint-focused approach'
    };
  }

  return {
    batchSize: Math.min(50, remainingRecords),
    strategy: 'conservative',
    reasoning: 'Stable conditions - using standard approach'
  };
};

export default progressiveBatchReduction;