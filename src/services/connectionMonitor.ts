import { supabase } from '../lib/supabase';

export interface ConnectionMetrics {
  activeConnections: number;
  maxConnections: number;
  connectionPoolUsage: number; // Percentage
  queuedRequests: number;
  averageResponseTimeMs: number;
  errorRate: number;
  lastSuccessfulConnection: Date;
  lastFailedConnection?: Date;
  connectionHealth: 'healthy' | 'degraded' | 'critical';
}

export interface DatabaseResourceMetrics {
  cpuUtilization?: number;
  memoryUtilization?: number;
  diskUsage?: number;
  activeQueries: number;
  longRunningQueries: number;
  lockWaitTime?: number;
  indexUtilization?: number;
}

export interface ConnectionAlert {
  type: 'connection_exhaustion' | 'high_response_time' | 'connection_failures' | 'resource_pressure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  metrics?: Partial<ConnectionMetrics>;
}

class ConnectionMonitor {
  private connectionMetrics: ConnectionMetrics = {
    activeConnections: 0,
    maxConnections: 100, // Default assumption
    connectionPoolUsage: 0,
    queuedRequests: 0,
    averageResponseTimeMs: 0,
    errorRate: 0,
    lastSuccessfulConnection: new Date(),
    connectionHealth: 'healthy'
  };

  private resourceMetrics: DatabaseResourceMetrics = {
    activeQueries: 0,
    longRunningQueries: 0
  };

  private alerts: ConnectionAlert[] = [];
  private responseTimeHistory: number[] = [];
  private connectionTestHistory: { timestamp: Date; success: boolean; responseTime: number }[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring: boolean = false;

  // Start monitoring database connections and resources
  startMonitoring(intervalMs: number = 30000) {
    if (this.isMonitoring) {
      console.log('⚠️  Connection monitoring is already active');
      return;
    }

    console.log(`🔍 Starting connection monitoring (interval: ${intervalMs}ms)`);
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      this.analyzeMetrics();
    }, intervalMs);

    // Initial metrics collection
    this.collectMetrics();
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('🛑 Connection monitoring stopped');
  }

  // Collect connection and resource metrics
  private async collectMetrics() {
    const startTime = Date.now();

    try {
      // Test basic connectivity and measure response time
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single();

      const responseTime = Date.now() - startTime;
      const success = !error;

      // Update response time history
      this.responseTimeHistory.push(responseTime);
      if (this.responseTimeHistory.length > 100) {
        this.responseTimeHistory = this.responseTimeHistory.slice(-100);
      }

      // Update connection test history
      this.connectionTestHistory.push({
        timestamp: new Date(),
        success,
        responseTime
      });
      if (this.connectionTestHistory.length > 100) {
        this.connectionTestHistory = this.connectionTestHistory.slice(-100);
      }

      // Update metrics
      this.connectionMetrics.averageResponseTimeMs = this.calculateAverageResponseTime();
      this.connectionMetrics.errorRate = this.calculateErrorRate();

      if (success) {
        this.connectionMetrics.lastSuccessfulConnection = new Date();
      } else {
        this.connectionMetrics.lastFailedConnection = new Date();
        console.warn('Connection test failed:', error?.message);
      }

      // Try to get database statistics (if available)
      await this.collectDatabaseStats();

    } catch (error) {
      console.error('Error collecting connection metrics:', error);
      this.connectionTestHistory.push({
        timestamp: new Date(),
        success: false,
        responseTime: Date.now() - startTime
      });
    }

    // Update connection health status
    this.updateConnectionHealth();
  }

  // Attempt to collect database statistics
  private async collectDatabaseStats() {
    try {
      // Try to get session information (may require elevated permissions)
      const { data: sessions } = await supabase.rpc('get_session_count').catch(() => ({ data: null }));
      
      if (sessions && typeof sessions === 'number') {
        this.connectionMetrics.activeConnections = sessions;
      }

      // Try to get database activity information
      const { data: activity } = await supabase.rpc('get_database_activity').catch(() => ({ data: null }));
      
      if (activity) {
        this.resourceMetrics.activeQueries = activity.active_queries || 0;
        this.resourceMetrics.longRunningQueries = activity.long_running_queries || 0;
      }

    } catch (error) {
      // Expected to fail in many cases due to RLS and permissions
      // This is normal and doesn't indicate a problem
    }
  }

  // Calculate average response time from recent history
  private calculateAverageResponseTime(): number {
    if (this.responseTimeHistory.length === 0) return 0;
    
    const sum = this.responseTimeHistory.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / this.responseTimeHistory.length);
  }

  // Calculate error rate from recent connection tests
  private calculateErrorRate(): number {
    const recentTests = this.connectionTestHistory.slice(-20); // Last 20 tests
    if (recentTests.length === 0) return 0;
    
    const failures = recentTests.filter(test => !test.success).length;
    return Math.round((failures / recentTests.length) * 100);
  }

  // Update connection health status based on metrics
  private updateConnectionHealth() {
    const { averageResponseTimeMs, errorRate } = this.connectionMetrics;

    if (errorRate > 50 || averageResponseTimeMs > 10000) {
      this.connectionMetrics.connectionHealth = 'critical';
    } else if (errorRate > 20 || averageResponseTimeMs > 5000) {
      this.connectionMetrics.connectionHealth = 'degraded';
    } else if (errorRate > 10 || averageResponseTimeMs > 2000) {
      this.connectionMetrics.connectionHealth = 'degraded';
    } else {
      this.connectionMetrics.connectionHealth = 'healthy';
    }

    // Update connection pool usage estimation
    if (this.connectionMetrics.activeConnections > 0) {
      this.connectionMetrics.connectionPoolUsage = 
        Math.round((this.connectionMetrics.activeConnections / this.connectionMetrics.maxConnections) * 100);
    }
  }

  // Analyze metrics and generate alerts
  private analyzeMetrics() {
    const now = new Date();
    const { connectionHealth, errorRate, averageResponseTimeMs, connectionPoolUsage } = this.connectionMetrics;

    // Clear old alerts (older than 1 hour)
    this.alerts = this.alerts.filter(alert => 
      (now.getTime() - alert.timestamp.getTime()) < 3600000
    );

    // Connection pool exhaustion alert
    if (connectionPoolUsage > 90) {
      this.addAlert({
        type: 'connection_exhaustion',
        severity: connectionPoolUsage > 95 ? 'critical' : 'high',
        message: `Connection pool usage is at ${connectionPoolUsage}%. Consider implementing connection pooling optimization.`,
        timestamp: now,
        metrics: { connectionPoolUsage, activeConnections: this.connectionMetrics.activeConnections }
      });
    }

    // High response time alert
    if (averageResponseTimeMs > 5000) {
      this.addAlert({
        type: 'high_response_time',
        severity: averageResponseTimeMs > 10000 ? 'critical' : 'high',
        message: `Average response time is ${averageResponseTimeMs}ms. Database may be under heavy load.`,
        timestamp: now,
        metrics: { averageResponseTimeMs }
      });
    }

    // Connection failure alert
    if (errorRate > 20) {
      this.addAlert({
        type: 'connection_failures',
        severity: errorRate > 50 ? 'critical' : 'high',
        message: `Connection error rate is ${errorRate}%. Network or database issues detected.`,
        timestamp: now,
        metrics: { errorRate }
      });
    }

    // Resource pressure alert
    if (connectionHealth === 'critical' || this.resourceMetrics.longRunningQueries > 5) {
      this.addAlert({
        type: 'resource_pressure',
        severity: 'critical',
        message: 'Database resource pressure detected. Long-running queries or system overload may be affecting performance.',
        timestamp: now,
        metrics: this.connectionMetrics
      });
    }
  }

  // Add alert (avoiding duplicates)
  private addAlert(alert: ConnectionAlert) {
    // Check if similar alert exists in last 5 minutes
    const recentSimilarAlert = this.alerts.find(existing => 
      existing.type === alert.type &&
      (alert.timestamp.getTime() - existing.timestamp.getTime()) < 300000 // 5 minutes
    );

    if (!recentSimilarAlert) {
      this.alerts.push(alert);
      console.warn(`🚨 Connection Alert (${alert.severity}): ${alert.message}`);
    }
  }

  // Test database connection with timeout
  async testConnectionWithTimeout(timeoutMs: number = 10000): Promise<{
    success: boolean;
    responseTimeMs: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timeout')), timeoutMs)
      );

      const connectionPromise = supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single();

      await Promise.race([connectionPromise, timeoutPromise]);
      
      return {
        success: true,
        responseTimeMs: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        responseTimeMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get optimal batch size based on current connection health
  getOptimalBatchSize(defaultSize: number, maxSize: number = 100): number {
    const { connectionHealth, connectionPoolUsage, averageResponseTimeMs } = this.connectionMetrics;

    // Reduce batch size based on connection health
    let optimalSize = defaultSize;

    if (connectionHealth === 'critical') {
      optimalSize = Math.max(5, Math.floor(defaultSize * 0.3)); // Reduce to 30%
    } else if (connectionHealth === 'degraded') {
      optimalSize = Math.max(10, Math.floor(defaultSize * 0.6)); // Reduce to 60%
    }

    // Further reduce based on connection pool usage
    if (connectionPoolUsage > 80) {
      optimalSize = Math.max(5, Math.floor(optimalSize * 0.7));
    }

    // Adjust based on response time
    if (averageResponseTimeMs > 3000) {
      optimalSize = Math.max(5, Math.floor(optimalSize * 0.8));
    }

    return Math.min(optimalSize, maxSize);
  }

  // Calculate recommended delay between batches
  getRecommendedBatchDelay(): number {
    const { connectionHealth, averageResponseTimeMs } = this.connectionMetrics;

    let baseDelay = 200; // Default delay

    if (connectionHealth === 'critical') {
      baseDelay = 2000; // 2 second delay
    } else if (connectionHealth === 'degraded') {
      baseDelay = 1000; // 1 second delay
    }

    // Increase delay based on response time
    if (averageResponseTimeMs > 2000) {
      baseDelay += Math.min(averageResponseTimeMs * 0.1, 3000);
    }

    return baseDelay;
  }

  // Get current metrics
  getCurrentMetrics(): ConnectionMetrics {
    return { ...this.connectionMetrics };
  }

  // Get resource metrics
  getResourceMetrics(): DatabaseResourceMetrics {
    return { ...this.resourceMetrics };
  }

  // Get active alerts
  getActiveAlerts(): ConnectionAlert[] {
    return [...this.alerts];
  }

  // Get connection health summary
  getHealthSummary(): {
    health: string;
    responseTime: number;
    errorRate: number;
    recommendedBatchSize: number;
    recommendedDelay: number;
    alerts: number;
  } {
    return {
      health: this.connectionMetrics.connectionHealth,
      responseTime: this.connectionMetrics.averageResponseTimeMs,
      errorRate: this.connectionMetrics.errorRate,
      recommendedBatchSize: this.getOptimalBatchSize(25),
      recommendedDelay: this.getRecommendedBatchDelay(),
      alerts: this.alerts.length
    };
  }

  // Check if system should enter circuit breaker mode
  shouldActivateCircuitBreaker(): boolean {
    const { connectionHealth, errorRate } = this.connectionMetrics;
    const criticalAlerts = this.alerts.filter(alert => alert.severity === 'critical');
    
    return (
      connectionHealth === 'critical' ||
      errorRate > 50 ||
      criticalAlerts.length > 2 ||
      this.resourceMetrics.longRunningQueries > 10
    );
  }
}

// Export singleton instance
export const connectionMonitor = new ConnectionMonitor();

// Utility functions
export const formatConnectionHealth = (health: string): string => {
  const icons: Record<string, string> = {
    healthy: '✅',
    degraded: '⚠️',
    critical: '🚨'
  };
  return `${icons[health] || '❓'} ${health.toUpperCase()}`;
};

export const formatAlert = (alert: ConnectionAlert): string => {
  const severityIcons: Record<string, string> = {
    low: '📋',
    medium: '⚠️',
    high: '🚨',
    critical: '🔴'
  };
  return `${severityIcons[alert.severity]} ${alert.message}`;
};

export default connectionMonitor;