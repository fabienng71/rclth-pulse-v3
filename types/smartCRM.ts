// Smart CRM: TypeScript Types and Interfaces
// Comprehensive type definitions for Activity-Lead Integration System

// ==========================================
// 1. LEAD CREATION RULES
// ==========================================

export interface LeadCreationRules {
  id: string;
  user_id: string;
  activity_types: string[];
  pipeline_stages: string[];
  keyword_triggers: string[];
  score_threshold: number;
  auto_create_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadCreationRulesForm {
  activity_types: string[];
  pipeline_stages: string[];
  keyword_triggers: string[];
  score_threshold: number;
  auto_create_enabled: boolean;
}

// ==========================================
// 2. BACKGROUND JOBS
// ==========================================

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface LeadCreationJob {
  id: string;
  activity_id: string;
  user_id: string;
  status: JobStatus;
  score?: number;
  lead_title?: string;
  safety_checks?: SafetyChecks;
  error_message?: string;
  attempts: number;
  max_attempts: number;
  created_at: string;
  processed_at?: string;
  next_retry?: string;
}

export interface JobResult {
  success: boolean;
  job_id?: string;
  lead_id?: string;
  error?: string;
  message?: string;
}

// ==========================================
// 3. ACTIVITY-LEAD LINKS
// ==========================================

export type LinkType = 'auto' | 'manual';

export interface ActivityLeadLink {
  id: string;
  activity_id: string;
  lead_id: string;
  link_type: LinkType;
  created_at: string;
  created_by?: string;
  
  // Joined data
  activity?: Activity;
  lead?: LeadCenter;
}

export interface LinkResult {
  success: boolean;
  message: string;
  action?: 'created' | 'existing' | 'no_change';
}

// ==========================================
// 4. LEAD INTELLIGENCE SCORING
// ==========================================

export interface LeadScoringFactors {
  activityType: number;        // 0-40 points
  pipelineStage: number;       // 0-40 points  
  keywordMatches: number;      // 0-20 points
  customerEngagement: number;  // 0-20 points
  estimatedValue: number;      // 0-15 points
  historicalSuccess: number;   // 0-15 points
}

export interface LeadScoringResult {
  score: number;               // 0-150 total
  confidence: number;          // 0-1 confidence level
  factors: LeadScoringFactors;
  recommendations: {
    shouldCreateLead: boolean;
    leadTitle: string;
    priority: 'Low' | 'Medium' | 'High';
    timeline: string;
    nextActions: string[];
    products: string[];
  };
  reasoning: string;
}

export interface ScoringBreakdown {
  factor: keyof LeadScoringFactors;
  label: string;
  score: number;
  maxScore: number;
  explanation: string;
}

// ==========================================
// 5. SAFETY VALIDATION
// ==========================================

export interface SafetyChecks {
  permissions: {
    canCreateLeads: boolean;
    canAccessActivity: boolean;
    canLinkActivities: boolean;
    respectsRLS: boolean;
  };
  dataIntegrity: {
    customerExists: boolean;
    contactExists: boolean;
    noExistingLead: boolean;
    validChannelData: boolean;
  };
  businessLogic: {
    scoreThresholdMet: boolean;
    userOptedIn: boolean;
    notDuplicateActivity: boolean;
    notAlreadyProcessed: boolean;
    validPipelineProgression: boolean;
  };
  systemHealth: {
    databaseConnected: boolean;
    leadTableAccessible: boolean;
    backgroundJobsRunning: boolean;
    sufficientResources: boolean;
  };
}

export interface SafetyValidationResult {
  passed: boolean;
  checks: SafetyChecks;
  failureReasons: string[];
}

// ==========================================
// 6. CONFLICT DETECTION
// ==========================================

export interface ConflictResult {
  hasConflict: boolean;
  existingLeads: ExistingLead[];
  similarActivities: SimilarActivity[];
  suggestMerge: boolean;
  suggestLink: boolean;
  recommendedAction: 'create_new_lead' | 'link_to_existing_lead' | 'review_for_duplicates';
}

export interface ExistingLead {
  id: string;
  title: string;
  status: string;
  created_at: string;
  estimated_value?: number;
}

export interface SimilarActivity {
  id: string;
  activity_type: string;
  activity_date: string;
  notes?: string;
  salesperson_name?: string;
}

// ==========================================
// 7. LEAD CREATION
// ==========================================

export interface LeadCreationParams {
  activityId: string;
  score: number;
  leadTitle: string;
  userPreferences: LeadCreationRules;
  overrideSafety?: boolean;
}

export interface LeadCreationResult {
  success: boolean;
  lead?: LeadCenter;
  leadId?: string;
  error?: string;
  message?: string;
  conflicts?: ConflictResult;
  action?: 'created' | 'linked_existing' | 'suggested_review';
}

export interface LeadFromActivityData {
  lead_title: string;
  lead_description: string;
  status: string;
  priority: 'Low' | 'Medium' | 'High';
  customer_id: string;
  contact_id?: string;
  lead_source: string;
  assigned_to?: string;
  customer_channel?: string;
  source_activity_id: string;
  auto_created: boolean;
  estimated_value?: number;
  close_probability?: number;
}

// ==========================================
// 8. TIMELINE EVENTS
// ==========================================

export type TimelineEventType = 'activity' | 'lead_created' | 'lead_update' | 'lead_status_change';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  event_date: string;
  
  // Activity events
  activity_type?: string;
  activity_date?: string;
  notes?: string;
  contact_name?: string;
  salesperson_name?: string;
  pipeline_stage?: string;
  linked_lead_id?: string;
  
  // Lead events
  lead_id?: string;
  lead_title?: string;
  status?: string;
  auto_created?: boolean;
  source_activity_id?: string;
  
  // Update events
  field_changed?: string;
  old_value?: string;
  new_value?: string;
}

export interface UnifiedTimeline {
  customer_id: string;
  events: TimelineEvent[];
  total_count: number;
  date_range: {
    start: string;
    end: string;
  };
}

// ==========================================
// 9. SMART CRM METRICS
// ==========================================

export interface SmartCRMMetrics {
  period_days: number;
  auto_created_leads: number;
  manual_leads: number;
  activity_sourced_leads: number;
  auto_conversion_rate: number;
  overall_conversion_rate: number;
  avg_auto_lead_value: number;
  avg_manual_lead_value: number;
  job_success_rate: number;
  avg_processing_time_seconds: number;
  total_background_jobs: number;
  
  // Trends (period over period)
  trends?: {
    auto_created_leads_change: number;
    conversion_rate_change: number;
    processing_time_change: number;
    user_adoption_change: number;
  };
}

export interface UserAdoptionMetrics {
  user_id: string;
  user_name: string;
  activities_created: number;
  leads_auto_created: number;
  leads_manual_created: number;
  adoption_rate: number;
  avg_lead_score: number;
  preferences_customized: boolean;
}

// ==========================================
// 10. UI COMPONENT PROPS
// ==========================================

export interface LeadIntelligencePanelProps {
  score: number;
  shouldCreate: boolean;
  leadTitle: string;
  onToggleCreate: (value: boolean) => void;
  onTitleChange: (title: string) => void;
  isLoading?: boolean;
  scoringBreakdown?: ScoringBreakdown[];
  isEditMode?: boolean;
}

export interface LeadQuickActionsProps {
  lead: LeadCenter;
  onActivityCreate?: (activityType: string) => void;
}

export interface UnifiedTimelineProps {
  customerId: string;
  limit?: number;
  showFilters?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
}

export interface SmartCRMDashboardProps {
  dateRange?: {
    start: string;
    end: string;
  };
  userId?: string; // For user-specific metrics
}

export interface LeadCreationPreferencesProps {
  onSave?: (rules: LeadCreationRulesForm) => void;
  isLoading?: boolean;
}

// ==========================================
// 11. NOTIFICATION TYPES
// ==========================================

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface SmartCRMNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  actions?: NotificationAction[];
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

export interface NotificationAction {
  label: string;
  url?: string;
  action?: string;
  style?: 'primary' | 'secondary' | 'destructive';
}

// ==========================================
// 12. API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    processing_time?: number;
  };
}

export interface LeadScoringResponse extends ApiResponse<LeadScoringResult> {}
export interface SafetyValidationResponse extends ApiResponse<SafetyValidationResult> {}
export interface ConflictDetectionResponse extends ApiResponse<ConflictResult> {}
export interface LeadCreationResponse extends ApiResponse<LeadCreationResult> {}
export interface TimelineResponse extends ApiResponse<UnifiedTimeline> {}
export interface MetricsResponse extends ApiResponse<SmartCRMMetrics> {}

// ==========================================
// 13. FORM DATA TYPES
// ==========================================

export interface ActivityFormDataEnhanced extends ActivityFormData {
  // Smart CRM additions
  create_lead?: boolean;
  lead_title?: string;
  lead_score?: number;
  override_safety?: boolean;
}

export interface ActivityWithLeadIntelligence extends Activity {
  // Smart CRM additions
  lead_creation_triggered?: boolean;
  lead_creation_score?: number;
  lead_processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  linked_leads?: LeadCenter[];
  lead_potential?: 'low' | 'medium' | 'high';
}

export interface LeadCenterEnhanced extends LeadCenter {
  // Smart CRM additions
  source_activity_id?: string;
  auto_created?: boolean;
  source_activity?: Activity;
  linked_activities?: Activity[];
  intelligence_score?: number;
}

// ==========================================
// 14. HOOK RETURN TYPES
// ==========================================

export interface UseLeadIntelligenceReturn {
  score: number;
  isCalculating: boolean;
  scoringResult: LeadScoringResult | null;
  error: string | null;
  recalculate: () => Promise<void>;
}

export interface UseLeadCreationRulesReturn {
  rules: LeadCreationRules | null;
  isLoading: boolean;
  error: string | null;
  updateRules: (updates: Partial<LeadCreationRulesForm>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export interface UseSmartCRMMetricsReturn {
  metrics: SmartCRMMetrics | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface UseUnifiedTimelineReturn {
  timeline: TimelineEvent[];
  isLoading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  refresh: () => void;
}

export interface UseLeadCreationReturn {
  createLeadFromActivity: (params: LeadCreationParams) => Promise<LeadCreationResult>;
  isCreating: boolean;
  error: string | null;
}

// ==========================================
// 15. UTILITY TYPES
// ==========================================

export type ActivityTypeScore = Record<string, number>;
export type PipelineStageScore = Record<string, number>;
export type KeywordTrigger = string;

export interface ScoreConfiguration {
  activityTypes: ActivityTypeScore;
  pipelineStages: PipelineStageScore;
  keywords: KeywordTrigger[];
  maxScores: {
    activityType: number;
    pipelineStage: number;
    keywords: number;
    engagement: number;
    estimatedValue: number;
    historical: number;
  };
}

// ==========================================
// 16. ERROR TYPES
// ==========================================

export class SmartCRMError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SmartCRMError';
  }
}

export class LeadCreationError extends SmartCRMError {
  constructor(message: string, details?: any) {
    super(message, 'LEAD_CREATION_ERROR', details);
  }
}

export class SafetyValidationError extends SmartCRMError {
  constructor(message: string, checks: SafetyChecks) {
    super(message, 'SAFETY_VALIDATION_ERROR', { checks });
  }
}

export class ConflictDetectionError extends SmartCRMError {
  constructor(message: string, conflicts: ConflictResult) {
    super(message, 'CONFLICT_DETECTION_ERROR', { conflicts });
  }
}

// ==========================================
// 17. CONSTANTS
// ==========================================

export const SMART_CRM_CONSTANTS = {
  MAX_SCORE: 150,
  DEFAULT_THRESHOLD: 60,
  MIN_THRESHOLD: 30,
  MAX_THRESHOLD: 150,
  
  ACTIVITY_TYPE_SCORES: {
    'Meeting': 40,
    'Demo': 40,
    'Proposal Presentation': 40,
    'Phone Call': 25,
    'Email': 15,
    'Walk-in': 30
  } as ActivityTypeScore,
  
  PIPELINE_STAGE_SCORES: {
    'Qualified': 40,
    'Proposal': 40,
    'Lead': 20,
    'Closed Won': 0,
    'Closed Lost': 0
  } as PipelineStageScore,
  
  DEFAULT_KEYWORDS: [
    'interested', 'opportunity', 'budget', 'timeline', 'decision',
    'proposal', 'quote', 'contract', 'purchase', 'buy', 'invest',
    'urgent', 'priority', 'requirement', 'specification'
  ],
  
  DEFAULT_ACTIVITY_TYPES: ['Meeting', 'Demo', 'Proposal Presentation'],
  
  JOB_RETRY_DELAYS: [60, 300, 900], // 1min, 5min, 15min
  
  NOTIFICATION_EXPIRY_DAYS: 7,
  
  METRICS_REFRESH_INTERVAL: 30000, // 30 seconds
} as const;

// ==========================================
// 18. TYPE EXPORTS
// ==========================================

// Re-export base types for convenience
export type { Activity } from './activity';
export type { LeadCenter } from './leadCenter';
export type { Contact } from './contact';
export type { Customer } from '@/hooks/useCustomersData';

// Make all types available as default export
export default {
  // ... all types would be here for default import
};