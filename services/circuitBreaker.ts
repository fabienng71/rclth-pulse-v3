import { ConnectionMetrics } from './connectionMonitor';

export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  recoveryTimeMs: number; // Time to wait before attempting recovery
  successThreshold: number; // Number of successes needed to close circuit from half-open
  timeWindowMs: number; // Time window for failure counting
  maxCooldownMs: number; // Maximum cooldown period
  enableAdaptiveThresholds: boolean; // Adjust thresholds based on system conditions
}

export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  totalRequests: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  stateChangeTime: Date;
  cooldownEndTime?: Date;
  currentThreshold: number;
  adaptiveMultiplier: number;
}

export interface SystemHealthIndicators {
  connectionHealth: 'healthy' | 'degraded' | 'critical';
  responseTimeMs: number;
  errorRatePercent: number;
  memoryPressure: boolean;
  consecutiveFailures: number;
  timeoutRate: number;
  constraintViolationRate: number;
}

export interface CircuitBreakerDecision {
  allowRequest: boolean;
  reason: string;
  suggestedDelay: number;
  alternativeAction?: 'reduce_batch_size' | 'individual_processing' | 'pause_upload' | 'change_strategy';
  systemHealthScore: number; // 0-100
}

class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private metrics: CircuitBreakerMetrics;
  private requestHistory: { timestamp: Date; success: boolean; responseTime: number }[] = [];
  private stateChangeListeners: Array<(newState: CircuitBreakerState, reason: string) => void> = [];

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeMs: 30000, // 30 seconds
      successThreshold: 3,
      timeWindowMs: 60000, // 1 minute
      maxCooldownMs: 300000, // 5 minutes
      enableAdaptiveThresholds: true,
      ...config
    };

    this.metrics = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      totalRequests: 0,
      stateChangeTime: new Date(),
      currentThreshold: this.config.failureThreshold,
      adaptiveMultiplier: 1.0
    };

    console.log('🔌 Circuit breaker initialized:', this.config);
  }

  // Check if request should be allowed and get recommendations
  checkRequest(systemHealth?: Partial<SystemHealthIndicators>): CircuitBreakerDecision {
    this.cleanupOldRequests();
    this.updateAdaptiveThresholds(systemHealth);
    
    const healthScore = this.calculateSystemHealthScore(systemHealth);
    
    switch (this.metrics.state) {
      case 'closed':
        return this.handleClosedState(healthScore, systemHealth);
      case 'open':
        return this.handleOpenState(healthScore, systemHealth);
      case 'half-open':
        return this.handleHalfOpenState(healthScore, systemHealth);
      default:
        return {
          allowRequest: false,
          reason: 'Unknown circuit breaker state',
          suggestedDelay: 5000,
          systemHealthScore: healthScore
        };
    }
  }

  // Record the result of a request
  recordResult(success: boolean, responseTimeMs: number = 0, errorType?: string): void {
    const now = new Date();
    
    this.requestHistory.push({
      timestamp: now,
      success,
      responseTime: responseTimeMs
    });

    // Keep only recent history
    if (this.requestHistory.length > 1000) {
      this.requestHistory = this.requestHistory.slice(-500);
    }

    this.metrics.totalRequests++;

    if (success) {
      this.handleSuccess(now);
    } else {
      this.handleFailure(now, errorType);
    }

    this.evaluateStateChange();
  }

  // Handle successful request
  private handleSuccess(timestamp: Date): void {
    this.metrics.successCount++;
    this.metrics.lastSuccessTime = timestamp;

    // In half-open state, count successes towards closing
    if (this.metrics.state === 'half-open') {
      if (this.metrics.successCount >= this.config.successThreshold) {
        this.changeState('closed', 'Success threshold reached in half-open state');
      }
    }

    // In closed state, gradually reduce adaptive threshold if system is stable
    if (this.metrics.state === 'closed' && this.metrics.successCount % 10 === 0) {
      this.metrics.adaptiveMultiplier = Math.max(0.5, this.metrics.adaptiveMultiplier * 0.95);
    }
  }

  // Handle failed request
  private handleFailure(timestamp: Date, errorType?: string): void {
    this.metrics.failureCount++;
    this.metrics.lastFailureTime = timestamp;

    // Increase adaptive threshold on failures
    if (this.config.enableAdaptiveThresholds) {
      this.metrics.adaptiveMultiplier = Math.min(3.0, this.metrics.adaptiveMultiplier * 1.1);
    }

    // Certain error types should be more aggressive in opening circuit
    let failureWeight = 1;
    if (errorType === 'timeout') failureWeight = 1.5;
    else if (errorType === 'connection') failureWeight = 2.0;
    else if (errorType === 'memory') failureWeight = 1.8;

    // Apply weighted failure counting
    this.metrics.failureCount += (failureWeight - 1);

    console.warn(`🚨 Circuit breaker recorded failure (type: ${errorType || 'unknown'}, weight: ${failureWeight}). Count: ${this.metrics.failureCount}/${this.metrics.currentThreshold}`);
  }

  // Evaluate if state should change
  private evaluateStateChange(): void {
    const now = new Date();
    const recentFailures = this.getRecentFailures();

    switch (this.metrics.state) {
      case 'closed':
        if (recentFailures >= this.metrics.currentThreshold) {
          this.changeState('open', `Failure threshold exceeded: ${recentFailures}/${this.metrics.currentThreshold}`);
        }
        break;

      case 'open':
        if (this.metrics.cooldownEndTime && now >= this.metrics.cooldownEndTime) {
          this.changeState('half-open', 'Cooldown period completed');
        }
        break;

      case 'half-open':
        // Half-open state changes are handled in handleSuccess/handleFailure
        break;
    }
  }

  // Handle closed state logic
  private handleClosedState(
    healthScore: number, 
    systemHealth?: Partial<SystemHealthIndicators>
  ): CircuitBreakerDecision {
    // Proactively detect deteriorating conditions
    if (healthScore < 30) {
      return {
        allowRequest: true,
        reason: 'Circuit closed but system health is poor - recommend caution',
        suggestedDelay: 1000,
        alternativeAction: 'reduce_batch_size',
        systemHealthScore: healthScore
      };
    }

    if (systemHealth?.consecutiveFailures && systemHealth.consecutiveFailures > 3) {
      return {
        allowRequest: true,
        reason: 'Circuit closed but consecutive failures detected - recommend smaller batches',
        suggestedDelay: 500,
        alternativeAction: 'reduce_batch_size',
        systemHealthScore: healthScore
      };
    }

    return {
      allowRequest: true,
      reason: 'Circuit closed - normal operation',
      suggestedDelay: 0,
      systemHealthScore: healthScore
    };
  }

  // Handle open state logic
  private handleOpenState(
    healthScore: number, 
    systemHealth?: Partial<SystemHealthIndicators>
  ): CircuitBreakerDecision {
    const now = new Date();
    const timeSinceOpened = now.getTime() - this.metrics.stateChangeTime.getTime();
    const remainingCooldown = Math.max(0, (this.metrics.cooldownEndTime?.getTime() || 0) - now.getTime());

    if (remainingCooldown > 0) {
      // Still in cooldown period
      let alternativeAction: CircuitBreakerDecision['alternativeAction'];
      
      if (healthScore < 20) {
        alternativeAction = 'pause_upload';
      } else if (systemHealth?.timeoutRate && systemHealth.timeoutRate > 0.5) {
        alternativeAction = 'individual_processing';
      } else {
        alternativeAction = 'change_strategy';
      }

      return {
        allowRequest: false,
        reason: `Circuit open - cooldown in progress (${Math.round(remainingCooldown / 1000)}s remaining)`,
        suggestedDelay: Math.min(remainingCooldown, 30000),
        alternativeAction,
        systemHealthScore: healthScore
      };
    }

    // Ready to attempt recovery
    return {
      allowRequest: false,
      reason: 'Circuit open - ready for recovery attempt',
      suggestedDelay: 0,
      alternativeAction: 'reduce_batch_size',
      systemHealthScore: healthScore
    };
  }

  // Handle half-open state logic
  private handleHalfOpenState(
    healthScore: number, 
    systemHealth?: Partial<SystemHealthIndicators>
  ): CircuitBreakerDecision {
    // Allow limited requests in half-open state
    const recentRequests = this.getRecentRequestCount(5000); // Last 5 seconds
    
    if (recentRequests >= 3) {
      return {
        allowRequest: false,
        reason: 'Circuit half-open - limiting request rate for testing',
        suggestedDelay: 2000,
        systemHealthScore: healthScore
      };
    }

    // If health is still poor, be more conservative
    if (healthScore < 40) {
      return {
        allowRequest: true,
        reason: 'Circuit half-open - testing with small batch due to poor health',
        suggestedDelay: 1000,
        alternativeAction: 'individual_processing',
        systemHealthScore: healthScore
      };
    }

    return {
      allowRequest: true,
      reason: 'Circuit half-open - testing system recovery',
      suggestedDelay: 500,
      alternativeAction: 'reduce_batch_size',
      systemHealthScore: healthScore
    };
  }

  // Change circuit breaker state
  private changeState(newState: CircuitBreakerState, reason: string): void {
    const oldState = this.metrics.state;
    this.metrics.state = newState;
    this.metrics.stateChangeTime = new Date();

    // Reset counters on state change
    if (newState === 'closed') {
      this.metrics.failureCount = 0;
      this.metrics.successCount = 0;
      this.metrics.cooldownEndTime = undefined;
    } else if (newState === 'open') {
      this.metrics.successCount = 0;
      // Calculate adaptive cooldown period
      const adaptiveCooldown = Math.min(
        this.config.maxCooldownMs,
        this.config.recoveryTimeMs * this.metrics.adaptiveMultiplier
      );
      this.metrics.cooldownEndTime = new Date(Date.now() + adaptiveCooldown);
    } else if (newState === 'half-open') {
      this.metrics.failureCount = 0;
      this.metrics.successCount = 0;
    }

    console.log(`🔄 Circuit breaker state: ${oldState} → ${newState} (${reason})`);
    
    // Notify listeners
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(newState, reason);
      } catch (error) {
        console.error('Error in circuit breaker state change listener:', error);
      }
    });
  }

  // Calculate system health score
  private calculateSystemHealthScore(systemHealth?: Partial<SystemHealthIndicators>): number {
    if (!systemHealth) return 75; // Default neutral score

    let score = 100;

    // Connection health impact
    if (systemHealth.connectionHealth === 'critical') score -= 40;
    else if (systemHealth.connectionHealth === 'degraded') score -= 20;

    // Response time impact
    if (systemHealth.responseTimeMs) {
      if (systemHealth.responseTimeMs > 10000) score -= 30;
      else if (systemHealth.responseTimeMs > 5000) score -= 15;
      else if (systemHealth.responseTimeMs > 2000) score -= 5;
    }

    // Error rate impact
    if (systemHealth.errorRatePercent) {
      score -= Math.min(30, systemHealth.errorRatePercent * 0.5);
    }

    // Memory pressure impact
    if (systemHealth.memoryPressure) score -= 15;

    // Consecutive failures impact
    if (systemHealth.consecutiveFailures) {
      score -= Math.min(25, systemHealth.consecutiveFailures * 3);
    }

    // Timeout rate impact
    if (systemHealth.timeoutRate) {
      score -= Math.min(20, systemHealth.timeoutRate * 20);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Get recent failure count within time window
  private getRecentFailures(): number {
    const cutoff = new Date(Date.now() - this.config.timeWindowMs);
    return this.requestHistory
      .filter(req => req.timestamp >= cutoff && !req.success)
      .length;
  }

  // Get recent request count
  private getRecentRequestCount(timeWindowMs: number): number {
    const cutoff = new Date(Date.now() - timeWindowMs);
    return this.requestHistory
      .filter(req => req.timestamp >= cutoff)
      .length;
  }

  // Update adaptive thresholds based on system conditions
  private updateAdaptiveThresholds(systemHealth?: Partial<SystemHealthIndicators>): void {
    if (!this.config.enableAdaptiveThresholds) return;

    const baseThreshold = this.config.failureThreshold;
    this.metrics.currentThreshold = Math.round(baseThreshold * this.metrics.adaptiveMultiplier);

    // Adjust based on system health
    if (systemHealth?.connectionHealth === 'critical') {
      this.metrics.currentThreshold = Math.max(1, Math.round(this.metrics.currentThreshold * 0.5));
    } else if (systemHealth?.connectionHealth === 'degraded') {
      this.metrics.currentThreshold = Math.max(2, Math.round(this.metrics.currentThreshold * 0.7));
    }
  }

  // Cleanup old request history
  private cleanupOldRequests(): void {
    const cutoff = new Date(Date.now() - (this.config.timeWindowMs * 2));
    this.requestHistory = this.requestHistory.filter(req => req.timestamp >= cutoff);
  }

  // Force open circuit (for testing or emergency)
  forceOpen(reason: string = 'Manual override'): void {
    this.changeState('open', reason);
  }

  // Force close circuit (for testing or recovery)
  forceClose(reason: string = 'Manual override'): void {
    this.changeState('closed', reason);
  }

  // Reset circuit breaker to initial state
  reset(): void {
    this.metrics = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      totalRequests: 0,
      stateChangeTime: new Date(),
      currentThreshold: this.config.failureThreshold,
      adaptiveMultiplier: 1.0
    };
    this.requestHistory = [];
    console.log('🔄 Circuit breaker reset to initial state');
  }

  // Add state change listener
  onStateChange(listener: (newState: CircuitBreakerState, reason: string) => void): void {
    this.stateChangeListeners.push(listener);
  }

  // Remove state change listener
  removeStateChangeListener(listener: (newState: CircuitBreakerState, reason: string) => void): void {
    const index = this.stateChangeListeners.indexOf(listener);
    if (index > -1) {
      this.stateChangeListeners.splice(index, 1);
    }
  }

  // Get current metrics
  getMetrics(): CircuitBreakerMetrics {
    return { ...this.metrics };
  }

  // Get configuration
  getConfig(): CircuitBreakerConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig: Partial<CircuitBreakerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Circuit breaker configuration updated:', newConfig);
  }

  // Get health summary
  getHealthSummary(): {
    state: CircuitBreakerState;
    healthScore: number;
    failureRate: number;
    avgResponseTime: number;
    recommendation: string;
  } {
    const recentRequests = this.requestHistory.slice(-50);
    const failures = recentRequests.filter(req => !req.success).length;
    const failureRate = recentRequests.length > 0 ? (failures / recentRequests.length) * 100 : 0;
    
    const responseTimes = recentRequests.map(req => req.responseTime).filter(time => time > 0);
    const avgResponseTime = responseTimes.length > 0 ? 
      Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length) : 0;

    let recommendation = '';
    switch (this.metrics.state) {
      case 'closed':
        recommendation = failureRate > 20 ? 'Monitor closely - failure rate increasing' : 'System operating normally';
        break;
      case 'open':
        recommendation = 'System overloaded - implement alternative processing strategy';
        break;
      case 'half-open':
        recommendation = 'Testing system recovery - use small batches';
        break;
    }

    // Mock health score calculation (would use real system health data)
    const healthScore = Math.max(0, 100 - (failureRate * 2) - Math.min(50, avgResponseTime / 100));

    return {
      state: this.metrics.state,
      healthScore: Math.round(healthScore),
      failureRate: Math.round(failureRate),
      avgResponseTime,
      recommendation
    };
  }
}

// Export singleton instance
export const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeMs: 30000,
  successThreshold: 3,
  timeWindowMs: 60000,
  maxCooldownMs: 300000,
  enableAdaptiveThresholds: true
});

// Utility functions
export const formatCircuitBreakerState = (state: CircuitBreakerState): string => {
  const icons: Record<CircuitBreakerState, string> = {
    closed: '✅',
    open: '🚨',
    'half-open': '⚠️'
  };
  return `${icons[state]} ${state.toUpperCase()}`;
};

export const getCircuitBreakerRecommendation = (decision: CircuitBreakerDecision): string => {
  if (!decision.allowRequest) {
    return `❌ Request blocked: ${decision.reason}. Wait ${Math.round(decision.suggestedDelay / 1000)}s`;
  }

  let message = `✅ Request allowed: ${decision.reason}`;
  if (decision.alternativeAction) {
    message += ` (Recommend: ${decision.alternativeAction})`;
  }
  return message;
};

// Circuit breaker decorator for functions
export const withCircuitBreaker = (
  fn: (...args: any[]) => Promise<any>,
  breakerName: string = 'default'
) => {
  return async (...args: any[]) => {
    const decision = circuitBreaker.checkRequest();
    
    if (!decision.allowRequest) {
      throw new Error(`Circuit breaker open: ${decision.reason}`);
    }

    const startTime = Date.now();
    try {
      const result = await fn(...args);
      circuitBreaker.recordResult(true, Date.now() - startTime);
      return result;
    } catch (error) {
      const errorType = error instanceof Error && error.message.includes('timeout') ? 'timeout' : 'unknown';
      circuitBreaker.recordResult(false, Date.now() - startTime, errorType);
      throw error;
    }
  };
};

export default circuitBreaker;