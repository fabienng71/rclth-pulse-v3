// Weekly Report Configuration
// Centralized configuration for business logic thresholds

export const WEEKLY_REPORT_CONFIG = {
  // New Customer Detection Thresholds
  NEW_CUSTOMER_THRESHOLDS: {
    MINIMUM_TRANSACTION_VALUE: 100.00,  // Minimum single transaction for meaningful new customer
    MINIMUM_WEEK_TOTAL: 200.00,         // Minimum weekly total for meaningful new customer
  },
  
  // At-Risk Customer Detection
  AT_RISK_THRESHOLDS: {
    WEEKS_WITHOUT_PURCHASE: 4,          // Number of weeks without purchase to be considered at-risk
    VALUE_TIERS: {
      HIGH_VALUE_THRESHOLD: 5000,       // Weekly turnover for high value tier
      MEDIUM_VALUE_THRESHOLD: 1000,     // Weekly turnover for medium value tier
    }
  },
  
  // Service Transactions Configuration
  SERVICE_TRANSACTIONS: {
    DEFAULT_INCLUDE: false,             // Default to exclude services to maintain current behavior
    SHOW_IN_SUMMARY: true,              // Display service impact in UI
    SERVICE_POSTING_GROUP: 'SRV',       // Define service identifier
    TYPICAL_IMPACT_PERCENTAGE: 3.5,     // Estimated typical impact of services on turnover
  },
  
  // Performance and Display Settings
  DISPLAY_SETTINGS: {
    MAX_CUSTOMER_INSIGHTS: 20,          // Maximum number of customer insights to return
    MAX_ITEM_INSIGHTS: 20,              // Maximum number of item insights to return
    MAX_AT_RISK_INSIGHTS: 20,           // Maximum number of at-risk insights to return
  },
  
  // Health Score Calculation
  HEALTH_SCORE: {
    EXCELLENT_THRESHOLD: 80,            // Health score threshold for "Excellent"
    GOOD_THRESHOLD: 60,                 // Health score threshold for "Good"
  },
  
  // Alert Thresholds for UI
  ALERT_THRESHOLDS: {
    HIGH_AT_RISK_COUNT: 5,              // Alert when at-risk customers > this number
    STRONG_ACQUISITION_COUNT: 10,       // Alert when new customers > this number
    LOW_MARGIN_PERCENTAGE: 5,           // Alert when margin % < this value
  },
  
  // Data Quality Settings
  DATA_QUALITY: {
    CACHE_DURATION_MINUTES: 5,          // Cache duration for query results
    PERFORMANCE_WARNING_MS: 5000,       // Warn if queries take longer than this
  }
} as const;

// Type definitions for the config
export type WeeklyReportConfig = typeof WEEKLY_REPORT_CONFIG;
export type NewCustomerThresholds = typeof WEEKLY_REPORT_CONFIG.NEW_CUSTOMER_THRESHOLDS;
export type AtRiskThresholds = typeof WEEKLY_REPORT_CONFIG.AT_RISK_THRESHOLDS;
export type ServiceTransactionsConfig = typeof WEEKLY_REPORT_CONFIG.SERVICE_TRANSACTIONS;