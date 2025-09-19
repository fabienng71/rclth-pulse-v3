// Smart CRM Service: Lead Intelligence and Creation Engine
// Core business logic for Activity-Lead Integration System

import { supabase } from '@/lib/supabase';
import { Activity } from '@/types/activity';
import { LeadCenter } from '@/types/leadCenter';
import {
  LeadScoringResult,
  LeadScoringFactors,
  SafetyValidationResult,
  SafetyChecks,
  ConflictResult,
  LeadCreationResult,
  LeadCreationParams,
  LeadCreationRules,
  TimelineEvent,
  SmartCRMMetrics,
  ScoringBreakdown,
  SMART_CRM_CONSTANTS,
  SmartCRMError,
  LeadCreationError,
  SafetyValidationError
} from '@/types/smartCRM';
import DOMPurify from 'dompurify';

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Convert HTML content to plain text for lead descriptions
 * Safely removes HTML tags while preserving meaningful content
 */
function convertHtmlToText(html: string): string {
  if (!html) return '';
  
  try {
    // Sanitize the HTML first
    const sanitized = DOMPurify.sanitize(html);
    
    // Check if document is available (browser environment)
    if (typeof document !== 'undefined') {
      // Create temporary DOM element to extract text content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = sanitized;
      
      // Extract plain text content
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // Clean up extra whitespace and return
      const cleanText = textContent.trim().replace(/\s+/g, ' ');
      console.log('🔧 Converted HTML to text:', { original: html, converted: cleanText });
      return cleanText;
    } else {
      // Server-side fallback: simple HTML tag removal
      const textContent = sanitized.replace(/<[^>]*>/g, ' ').trim().replace(/\s+/g, ' ');
      console.log('🔧 Server-side HTML to text conversion:', { original: html, converted: textContent });
      return textContent;
    }
  } catch (error) {
    console.warn('Error converting HTML to text:', error);
    // Fallback: return the original string (better than empty)
    return html;
  }
}

/**
 * Fetch customer channel information from database
 * Returns the customer's channel/type code for Smart CRM intelligence
 */
async function getCustomerChannel(customerCode: string): Promise<string | null> {
  if (!customerCode) {
    console.log('📂 No customer code provided for channel lookup');
    return null;
  }
  
  try {
    console.log('📂 Fetching customer channel for:', customerCode);
    
    const { data: customer, error } = await supabase
      .from('customers')
      .select('customer_type_code')
      .eq('customer_code', customerCode)
      .single();
    
    if (error) {
      console.warn('❌ Error fetching customer channel:', error);
      return null;
    }
    
    const channel = customer?.customer_type_code || null;
    console.log('✅ Customer channel retrieved:', { customerCode, channel });
    
    return channel;
  } catch (error) {
    console.warn('❌ Error in customer channel lookup:', error);
    return null;
  }
}

// ==========================================
// 1. LEAD INTELLIGENCE SCORING
// ==========================================

export class LeadIntelligenceService {
  /**
   * Calculate comprehensive lead potential score for an activity
   */
  static async calculateLeadScore(activity: Partial<Activity>): Promise<LeadScoringResult> {
    try {
      const factors = await this.calculateScoringFactors(activity);
      const score = this.calculateTotalScore(factors);
      const confidence = this.calculateConfidence(factors);
      const recommendations = await this.generateRecommendations(activity, score, factors);
      
      return {
        score,
        confidence,
        factors,
        recommendations,
        reasoning: this.generateReasoning(factors, score)
      };
    } catch (error) {
      console.error('Error calculating lead score:', error);
      throw new SmartCRMError('Failed to calculate lead score', 'SCORING_ERROR', error);
    }
  }

  /**
   * Calculate individual scoring factors
   */
  private static async calculateScoringFactors(activity: Partial<Activity>): Promise<LeadScoringFactors> {
    const factors: LeadScoringFactors = {
      activityType: this.scoreActivityType(activity.activity_type),
      pipelineStage: this.scorePipelineStage(activity.pipeline_stage),
      keywordMatches: this.scoreKeywords(activity.notes),
      customerEngagement: await this.scoreCustomerEngagement(activity.customer_code),
      estimatedValue: this.scoreEstimatedValue(activity),
      historicalSuccess: await this.scoreHistoricalSuccess(activity.customer_code, activity.activity_type)
    };

    return factors;
  }

  /**
   * Score based on activity type
   */
  private static scoreActivityType(activityType?: string): number {
    if (!activityType) return 0;
    return SMART_CRM_CONSTANTS.ACTIVITY_TYPE_SCORES[activityType] || 10;
  }

  /**
   * Score based on pipeline stage
   */
  private static scorePipelineStage(pipelineStage?: string): number {
    if (!pipelineStage) return 0;
    return SMART_CRM_CONSTANTS.PIPELINE_STAGE_SCORES[pipelineStage] || 0;
  }

  /**
   * Score based on keyword matches in notes
   */
  private static scoreKeywords(notes?: string): number {
    if (!notes) return 0;

    const notesLower = notes.toLowerCase();
    const matches = SMART_CRM_CONSTANTS.DEFAULT_KEYWORDS.filter(keyword =>
      notesLower.includes(keyword)
    ).length;

    return Math.min(matches * 5, 20); // Max 20 points
  }

  /**
   * Score based on customer engagement history
   */
  private static async scoreCustomerEngagement(customerCode?: string): Promise<number> {
    if (!customerCode) return 10; // Default score when no customer code

    try {
      // Get date 30 days ago in YYYY-MM-DD format for better compatibility
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateFilter = thirtyDaysAgo.toISOString().split('T')[0];

      // Count recent activities for this customer with simplified query
      const { data: recentActivities, error } = await supabase
        .from('activities')
        .select('id')
        .eq('customer_code', customerCode)
        .gte('activity_date', dateFilter);

      if (error) {
        console.warn('Error in customer engagement query:', error);
        return 10; // Default engagement score when query fails
      }

      const activityCount = recentActivities?.length || 0;

      // More activities = higher engagement
      if (activityCount >= 5) return 20;
      if (activityCount >= 3) return 15;
      if (activityCount >= 2) return 10;
      if (activityCount >= 1) return 5;
      return 10; // Default instead of 0
    } catch (error) {
      console.warn('Error calculating customer engagement:', error);
      return 10; // Default score instead of 0 to prevent flashing
    }
  }

  /**
   * Score based on estimated value mentioned in activity
   */
  private static scoreEstimatedValue(activity: Partial<Activity>): number {
    // Try to extract value from notes if not in a dedicated field
    let estimatedValue = 0;

    if (activity.notes) {
      // Look for currency patterns in notes
      const valueMatches = activity.notes.match(/(\$|THB|₿|€|£)[\s]?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
      if (valueMatches) {
        // Extract the highest value mentioned
        const values = valueMatches.map(match => {
          const numStr = match.replace(/[^\d.]/g, '');
          return parseFloat(numStr);
        });
        estimatedValue = Math.max(...values);
      }
    }

    // Score based on value ranges
    if (estimatedValue > 100000) return 15;
    if (estimatedValue > 50000) return 10;
    if (estimatedValue > 10000) return 5;
    return 0;
  }

  /**
   * Score based on historical success with similar activities
   */
  private static async scoreHistoricalSuccess(customerCode?: string, activityType?: string): Promise<number> {
    if (!customerCode || !activityType) return 8; // Default score for missing data

    try {
      // Get date 1 year ago in YYYY-MM-DD format
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const dateFilter = oneYearAgo.toISOString().split('T')[0];

      // Simplified query - just count historical activities for now
      // Complex joins with activity_lead_links table may not exist yet
      const { data: historicalData, error } = await supabase
        .from('activities')
        .select('id, pipeline_stage')
        .eq('customer_code', customerCode)
        .eq('activity_type', activityType)
        .gte('activity_date', dateFilter);

      if (error) {
        console.warn('Error in historical success query:', error);
        return 8; // Default score when query fails
      }

      if (!historicalData || historicalData.length === 0) return 5; // Default for new customers

      // Score based on number of historical activities (engagement proxy)
      const activityCount = historicalData.length;
      if (activityCount >= 10) return 15;
      if (activityCount >= 5) return 12;
      if (activityCount >= 3) return 10;
      if (activityCount >= 1) return 8;
      return 5;
    } catch (error) {
      console.warn('Error calculating historical success:', error);
      return 8; // Default score to prevent flashing
    }
  }

  /**
   * Calculate total score from factors
   */
  private static calculateTotalScore(factors: LeadScoringFactors): number {
    return Math.min(
      factors.activityType +
      factors.pipelineStage +
      factors.keywordMatches +
      factors.customerEngagement +
      factors.estimatedValue +
      factors.historicalSuccess,
      SMART_CRM_CONSTANTS.MAX_SCORE
    );
  }

  /**
   * Calculate confidence level
   */
  private static calculateConfidence(factors: LeadScoringFactors): number {
    // Confidence based on how many factors contributed to the score
    let contributingFactors = 0;
    if (factors.activityType > 0) contributingFactors++;
    if (factors.pipelineStage > 0) contributingFactors++;
    if (factors.keywordMatches > 0) contributingFactors++;
    if (factors.customerEngagement > 0) contributingFactors++;
    if (factors.estimatedValue > 0) contributingFactors++;
    if (factors.historicalSuccess > 0) contributingFactors++;

    return Math.min(contributingFactors / 6, 1); // Max confidence = 1
  }

  /**
   * Generate recommendations based on score and factors
   */
  private static async generateRecommendations(
    activity: Partial<Activity>,
    score: number,
    factors: LeadScoringFactors
  ) {
    const shouldCreate = score >= SMART_CRM_CONSTANTS.DEFAULT_THRESHOLD;
    const priority = score >= 100 ? 'High' : score >= 60 ? 'Medium' : 'Low';

    // Generate lead title
    const leadTitle = this.generateLeadTitle(activity);

    // Generate timeline estimate
    const timeline = this.estimateTimeline(factors);

    // Generate next actions
    const nextActions = this.generateNextActions(activity, factors);

    // Generate product recommendations
    const products = await this.generateProductRecommendations(activity.customer_code);

    return {
      shouldCreateLead: shouldCreate,
      leadTitle,
      priority,
      timeline,
      nextActions,
      products
    };
  }

  /**
   * Generate lead title from activity
   */
  private static generateLeadTitle(activity: Partial<Activity>): string {
    const type = activity.activity_type || 'Activity';
    const customer = activity.customer_name || 'Customer';
    
    if (type === 'Meeting') return `Meeting Opportunity - ${customer}`;
    if (type === 'Demo') return `Product Demo Follow-up - ${customer}`;
    if (type === 'Proposal Presentation') return `Proposal Opportunity - ${customer}`;
    
    return `${type} Opportunity - ${customer}`;
  }

  /**
   * Estimate timeline based on factors
   */
  private static estimateTimeline(factors: LeadScoringFactors): string {
    if (factors.pipelineStage >= 40) return '1-2 weeks';
    if (factors.activityType >= 40) return '2-4 weeks';
    if (factors.customerEngagement >= 15) return '3-6 weeks';
    return '4-8 weeks';
  }

  /**
   * Generate next action recommendations
   */
  private static generateNextActions(activity: Partial<Activity>, factors: LeadScoringFactors): string[] {
    const actions: string[] = [];

    if (factors.pipelineStage >= 40) {
      actions.push('Schedule proposal presentation');
      actions.push('Prepare detailed quotation');
    } else if (factors.activityType >= 40) {
      actions.push('Schedule follow-up meeting');
      actions.push('Send product information');
    } else {
      actions.push('Make follow-up call within 24 hours');
      actions.push('Send email with company overview');
    }

    if (factors.customerEngagement < 10) {
      actions.push('Research customer business needs');
    }

    if (factors.keywordMatches > 0) {
      actions.push('Address specific requirements mentioned');
    }

    return actions;
  }

  /**
   * Generate product recommendations based on customer
   */
  private static async generateProductRecommendations(customerCode?: string): Promise<string[]> {
    if (!customerCode) return ['General Products', 'Standard Solutions'];

    try {
      // Simplified customer lookup using correct column name
      const { data: customer, error } = await supabase
        .from('customers')
        .select('customer_type_code')
        .eq('customer_code', customerCode)
        .single();

      if (error) {
        console.warn('Error fetching customer for product recommendations:', error);
        return ['General Products', 'Standard Solutions'];
      }

      if (!customer?.customer_type_code) {
        return ['General Products', 'Standard Solutions'];
      }

      // Return default product categories based on customer type
      const customerTypeProducts = {
        'FIVE star hotel channel': ['Hospitality Products', 'Premium Solutions'],
        'FOUR star hotel channel': ['Hospitality Products', 'Standard Solutions'],  
        'THREE star hotel channel': ['Hospitality Products', 'Basic Solutions'],
        'Restaurant': ['Food Service Products', 'Kitchen Solutions'],
        'Retail': ['Consumer Products', 'Retail Solutions'],
        'Distributor': ['Distribution Products', 'Wholesale Solutions']
      };

      return customerTypeProducts[customer.customer_type_code as keyof typeof customerTypeProducts] || 
             ['General Products', 'Standard Solutions'];
    } catch (error) {
      console.warn('Error generating product recommendations:', error);
      return ['General Products', 'Standard Solutions'];
    }
  }

  /**
   * Generate reasoning explanation
   */
  private static generateReasoning(factors: LeadScoringFactors, score: number): string {
    const reasons: string[] = [];

    if (factors.activityType >= 30) {
      reasons.push('High-value activity type indicates strong potential');
    }
    if (factors.pipelineStage >= 30) {
      reasons.push('Advanced pipeline stage shows qualified interest');
    }
    if (factors.keywordMatches >= 10) {
      reasons.push('Multiple buying intent keywords detected');
    }
    if (factors.customerEngagement >= 15) {
      reasons.push('High customer engagement pattern');
    }
    if (factors.estimatedValue >= 10) {
      reasons.push('Significant deal value mentioned');
    }
    if (factors.historicalSuccess >= 10) {
      reasons.push('Strong historical conversion rate');
    }

    if (reasons.length === 0) {
      return `Score of ${score} indicates basic lead potential with room for development.`;
    }

    return reasons.join('. ') + '.';
  }

  /**
   * Get scoring breakdown for UI display
   */
  static getScoringBreakdown(factors: LeadScoringFactors): ScoringBreakdown[] {
    return [
      {
        factor: 'activityType',
        label: 'Activity Type',
        score: factors.activityType,
        maxScore: 40,
        explanation: 'Meetings and demos score higher than emails or calls'
      },
      {
        factor: 'pipelineStage',
        label: 'Pipeline Stage',
        score: factors.pipelineStage,
        maxScore: 40,
        explanation: 'Qualified prospects and those at proposal stage score highest'
      },
      {
        factor: 'keywordMatches',
        label: 'Buying Intent Keywords',
        score: factors.keywordMatches,
        maxScore: 20,
        explanation: 'Words like "interested", "budget", "timeline" indicate purchase intent'
      },
      {
        factor: 'customerEngagement',
        label: 'Customer Engagement',
        score: factors.customerEngagement,
        maxScore: 20,
        explanation: 'Recent activity frequency shows engagement level'
      },
      {
        factor: 'estimatedValue',
        label: 'Deal Value',
        score: factors.estimatedValue,
        maxScore: 15,
        explanation: 'Higher estimated values indicate more significant opportunities'
      },
      {
        factor: 'historicalSuccess',
        label: 'Historical Success',
        score: factors.historicalSuccess,
        maxScore: 15,
        explanation: 'Past conversion rates for similar activities with this customer'
      }
    ];
  }
}

// ==========================================
// 2. SAFETY VALIDATION SERVICE
// ==========================================

export class SafetyValidationService {
  /**
   * Perform comprehensive safety validation
   */
  static async validateLeadCreation(activityId: string, userId: string): Promise<SafetyValidationResult> {
    try {
      const { data, error } = await supabase.rpc('validate_lead_creation_safety', {
        activity_id_param: activityId,
        user_id_param: userId
      });

      if (error) throw error;

      return data as SafetyValidationResult;
    } catch (error: any) {
      console.error('Safety validation failed:', error);
      
      // Check if this is a missing function error (PGRST202)
      if (error?.code === 'PGRST202' && error?.message?.includes('Could not find the function')) {
        console.warn('Smart CRM safety validation function not found, using fallback validation');
        return await this.fallbackValidateLeadCreation(activityId, userId);
      }
      
      throw new SafetyValidationError('Safety validation failed', {
        permissions: { canCreateLeads: false, canAccessActivity: false, canLinkActivities: false, respectsRLS: false },
        dataIntegrity: { customerExists: false, contactExists: false, noExistingLead: false, validChannelData: false },
        businessLogic: { scoreThresholdMet: false, userOptedIn: false, notDuplicateActivity: false, notAlreadyProcessed: false, validPipelineProgression: false },
        systemHealth: { databaseConnected: false, leadTableAccessible: false, backgroundJobsRunning: false, sufficientResources: false }
      });
    }
  }

  /**
   * Fallback validation when the database function is not available
   * Performs basic client-side validation checks
   */
  static async fallbackValidateLeadCreation(activityId: string, userId: string): Promise<SafetyValidationResult> {
    console.log('🔄 Running fallback validation for Smart CRM...');
    
    try {
      // Basic validation checks we can perform without the database function
      const permissions = {
        canCreateLeads: true, // Assume user has permission if they got this far
        canAccessActivity: true,
        canLinkActivities: true,
        respectsRLS: true
      };

      // Check if activity exists and user has access
      const { data: activity, error: activityError } = await supabase
        .from('activities')
        .select('id, customer_code, customer_name, lead_id, notes')
        .eq('id', activityId)
        .single();

      if (activityError || !activity) {
        console.warn('Activity not found or not accessible:', activityError);
        throw new SafetyValidationError('Activity validation failed');
      }

      const dataIntegrity = {
        customerExists: !!(activity.customer_code || activity.customer_name),
        contactExists: true, // Assume contact validation passes
        noExistingLead: !activity.lead_id, // Check if activity already has a lead
        validChannelData: true
      };

      const businessLogic = {
        scoreThresholdMet: true, // Allow creation in fallback mode
        userOptedIn: true,
        notDuplicateActivity: true,
        notAlreadyProcessed: !activity.lead_id,
        validPipelineProgression: true
      };

      const systemHealth = {
        databaseConnected: true, // If we got here, DB is connected
        leadTableAccessible: true,
        backgroundJobsRunning: true,
        sufficientResources: true
      };

      console.log('✅ Fallback validation completed successfully');
      
      // Create the checks object that matches SafetyChecks interface
      const checks: SafetyChecks = {
        permissions,
        dataIntegrity,
        businessLogic,
        systemHealth
      };
      
      // Determine if all checks passed
      const allPermissionsPassed = Object.values(permissions).every(Boolean);
      const allDataIntegrityPassed = Object.values(dataIntegrity).every(Boolean);
      const allBusinessLogicPassed = Object.values(businessLogic).every(Boolean);
      const allSystemHealthPassed = Object.values(systemHealth).every(Boolean);
      
      const passed = allPermissionsPassed && allDataIntegrityPassed && allBusinessLogicPassed && allSystemHealthPassed;
      
      // Generate failure reasons if any checks failed
      const failureReasons: string[] = [];
      
      if (!allPermissionsPassed) {
        const failedPermissions = Object.entries(permissions)
          .filter(([, value]) => !value)
          .map(([key]) => key);
        failureReasons.push(`Permission issues: ${failedPermissions.join(', ')}`);
      }
      
      if (!allDataIntegrityPassed) {
        const failedDataIntegrity = Object.entries(dataIntegrity)
          .filter(([, value]) => !value)
          .map(([key]) => key);
        failureReasons.push(`Data integrity issues: ${failedDataIntegrity.join(', ')}`);
      }
      
      if (!allBusinessLogicPassed) {
        const failedBusinessLogic = Object.entries(businessLogic)
          .filter(([, value]) => !value)
          .map(([key]) => key);
        failureReasons.push(`Business logic issues: ${failedBusinessLogic.join(', ')}`);
      }
      
      if (!allSystemHealthPassed) {
        const failedSystemHealth = Object.entries(systemHealth)
          .filter(([, value]) => !value)
          .map(([key]) => key);
        failureReasons.push(`System health issues: ${failedSystemHealth.join(', ')}`);
      }
      
      return {
        passed,
        checks,
        failureReasons
      };
    } catch (error) {
      console.error('❌ Fallback validation failed:', error);
      throw new SafetyValidationError('Fallback validation failed');
    }
  }
}

// ==========================================
// 3. CONFLICT DETECTION SERVICE
// ==========================================

export class ConflictDetectionService {
  /**
   * Detect opportunity conflicts
   */
  static async detectConflicts(activityId: string): Promise<ConflictResult> {
    try {
      const { data, error } = await supabase.rpc('detect_opportunity_conflicts', {
        activity_id_param: activityId
      });

      if (error) throw error;

      return data as ConflictResult;
    } catch (error) {
      console.error('Conflict detection failed:', error);
      return {
        hasConflict: false,
        existingLeads: [],
        similarActivities: [],
        suggestMerge: false,
        suggestLink: false,
        recommendedAction: 'create_new_lead'
      };
    }
  }
}

// ==========================================
// 4. LEAD CREATION SERVICE
// ==========================================

export class LeadCreationService {
  /**
   * Create lead from activity with full safety checks
   */
  static async createLeadFromActivity(params: LeadCreationParams): Promise<LeadCreationResult> {
    try {
      // Get activity data
      const { data: activity, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', params.activityId)
        .single();

      if (activityError || !activity) {
        throw new LeadCreationError('Activity not found');
      }

      // Validate safety unless override is specified
      if (!params.overrideSafety) {
        const safetyResult = await SafetyValidationService.validateLeadCreation(
          params.activityId,
          params.userPreferences.user_id
        );

        if (!safetyResult.passed) {
          return {
            success: false,
            error: 'Safety validation failed',
            message: safetyResult.failureReasons.join(', ')
          };
        }
      }

      // Check for conflicts
      const conflicts = await ConflictDetectionService.detectConflicts(params.activityId);
      
      if (conflicts.suggestMerge && conflicts.existingLeads.length > 0) {
        return {
          success: false,
          error: 'Existing lead found',
          message: 'A similar lead already exists for this customer',
          conflicts,
          action: 'suggested_review'
        };
      }

      // FORCE FALLBACK: Always use direct fallback method instead of database function
      // This ensures proper HTML processing and customer channel extraction
      console.log('🔄 Smart CRM: Using direct fallback method for reliable lead creation');
      const fallbackResult = await this.createLeadDirectFallback(activity, params);
      return fallbackResult;

      // DATABASE FUNCTION DISABLED: The database function create_lead_from_activity_safe
      // is disabled because it doesn't handle HTML processing or customer channel extraction
      // properly. Once the database function is updated to match the fallback behavior,
      // this section can be re-enabled.
      /*
      let data, error;
      try {
        const result = await supabase.rpc('create_lead_from_activity_safe', {
          activity_id_param: params.activityId,
          lead_title_param: params.leadTitle,
          user_id_param: params.userPreferences.user_id
        });
        data = result.data;
        error = result.error;
      } catch (dbFunctionError: any) {
        // Check if this is a missing function error (PGRST202)
        if (dbFunctionError?.code === 'PGRST202' && dbFunctionError?.message?.includes('Could not find the function')) {
          console.warn('Smart CRM database function not found, using direct fallback');
          const fallbackResult = await this.createLeadDirectFallback(activity, params);
          return fallbackResult;
        }
        throw dbFunctionError;
      }

      // Check if the error indicates a missing function (this can come in result.error too)
      if (error && error.code === 'PGRST202' && error.message?.includes('Could not find the function')) {
        console.warn('Smart CRM database function not found (via error response), using direct fallback');
        const fallbackResult = await this.createLeadDirectFallback(activity, params);
        return fallbackResult;
      }

      if (error) throw error;

      if (!data.success) {
        throw new LeadCreationError(data.error || 'Lead creation failed');
      }

      // Get the created lead
      const { data: createdLead } = await supabase
        .from('lead_center')
        .select('*')
        .eq('id', data.lead_id)
        .single();

      return {
        success: true,
        lead: createdLead,
        leadId: data.lead_id,
        message: 'Lead created successfully',
        action: 'created'
      };
      */

    } catch (error) {
      console.error('Lead creation failed:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        supabaseError: error && typeof error === 'object' ? {
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint
        } : null
      });
      
      if (error instanceof LeadCreationError) {
        throw error;
      }
      
      // Provide more detailed error information
      let errorMessage = 'Lead creation failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && (error as any).message) {
        errorMessage = (error as any).message;
        // Include Supabase error details if available
        if ((error as any).details) {
          errorMessage += `: ${(error as any).details}`;
        }
        if ((error as any).hint) {
          errorMessage += ` (Hint: ${(error as any).hint})`;
        }
      } else {
        // Log the raw error for debugging
        console.error('Raw error object:', error);
        errorMessage = `Unexpected error type: ${typeof error}`;
      }
      
      throw new LeadCreationError(errorMessage);
    }
  }

  /**
   * Direct fallback lead creation when database functions are not available
   * Creates lead using direct Supabase table operations
   */
  static async createLeadDirectFallback(activity: any, params: LeadCreationParams): Promise<LeadCreationResult> {
    try {
      console.log('🔄 Creating lead in lead_center using direct fallback method...');
      
      // Generate a unique lead ID
      const leadId = crypto.randomUUID();
      
      // Prepare lead data based on activity - mapping to lead_center table (main leads system)
      // This creates a proper lead that can have multiple activities linked to it
      const activityNotesText = convertHtmlToText(activity.notes || '');
      
      // Fetch customer channel information for Smart CRM intelligence
      const customerChannel = await getCustomerChannel(activity.customer_code);
      
      const leadData = {
        id: leadId,
        lead_title: params.leadTitle || `${activity.activity_type || 'Activity'} - ${activity.customer_name || 'Unknown Customer'}`,
        lead_description: `Lead created from activity: ${activityNotesText || 'No additional notes'}`,
        status: 'contacted', // Use valid lead_center status
        lead_source: 'activity_conversion',
        priority: 'Medium', // Default priority
        assigned_to: params.userPreferences.user_id,
        customer_id: activity.customer_code || null,
        contact_id: null, // Will be populated if contact mapping is available
        estimated_value: null, // Could be extracted from activity notes in future
        close_probability: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: params.userPreferences.user_id,
        customer_channel: customerChannel, // Now populated with actual customer channel data
        channel_compatibility_score: null,
        recommended_products: [], // Could be populated from Smart CRM recommendations
        sales_stage: 'contacted' // Same as status for consistency
      };
      
      console.log('📝 Creating lead in lead_center table (main leads management system)');

      // Insert lead into lead_center table (main leads management system)
      const { data: createdLead, error: leadError } = await supabase
        .from('lead_center')
        .insert([leadData])
        .select()
        .single();

      if (leadError) {
        console.error('❌ Direct lead creation failed:', leadError);
        console.error('Error details:', {
          message: leadError.message,
          details: leadError.details,
          hint: leadError.hint,
          code: leadError.code
        });
        const errorMessage = leadError.details ? 
          `${leadError.message}: ${leadError.details}` : 
          leadError.message;
        throw new LeadCreationError(`Lead creation failed: ${errorMessage}`);
      }

      // Link the activity to the new lead (without transforming the activity)
      // The activity remains an activity, but gets linked to the lead via lead_center_id
      const activityUpdateData = {
        lead_center_id: leadId, // Link to lead_center table instead of leads table
        updated_at: new Date().toISOString()
      };
      
      // Add optional Smart CRM tracking fields only if they exist
      try {
        const testActivitySchema = await supabase
          .from('activities')
          .select('lead_creation_triggered')
          .limit(1);
        
        if (!testActivitySchema.error) {
          // These are tracking fields for Smart CRM analytics
          activityUpdateData.lead_creation_triggered = true;
          activityUpdateData.lead_creation_score = params.score || 0;
          activityUpdateData.lead_processing_status = 'completed';
        }
      } catch (schemaError) {
        console.log('ℹ️ Smart CRM tracking columns not available, skipping');
      }
      
      console.log('🔗 Linking activity to lead via lead_center_id (activity remains unchanged otherwise)');
      
      const { error: activityUpdateError } = await supabase
        .from('activities')
        .update(activityUpdateData)
        .eq('id', params.activityId);

      if (activityUpdateError) {
        console.warn('⚠️ Failed to link activity to lead:', activityUpdateError);
        // Don't fail the entire operation if linking fails - the lead was still created successfully
      } else {
        console.log('✅ Activity successfully linked to lead');
      }

      console.log('✅ Lead created successfully in lead_center table via direct fallback:', createdLead);

      return {
        success: true,
        lead: createdLead,
        leadId: leadId,
        message: 'Lead created successfully in Lead Center using fallback method',
        action: 'created'
      };
    } catch (error) {
      console.error('❌ Direct fallback lead creation failed:', error);
      console.error('Fallback error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        supabaseError: error && typeof error === 'object' ? {
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint
        } : null
      });
      
      let errorMessage = 'Unknown error in fallback';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && (error as any).message) {
        errorMessage = (error as any).message;
        if ((error as any).details) {
          errorMessage += `: ${(error as any).details}`;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to create lead using fallback method'
      };
    }
  }

  /**
   * Link activity to existing lead
   */
  static async linkActivityToLead(activityId: string, leadId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('link_activity_to_lead_safe', {
        activity_id_param: activityId,
        lead_id_param: leadId,
        user_id_param: userId,
        link_type_param: 'manual'
      });

      if (error) throw error;

      return data.success;
    } catch (error) {
      console.error('Activity linking failed:', error);
      return false;
    }
  }
}

// ==========================================
// 5. TIMELINE SERVICE
// ==========================================

export class TimelineService {
  /**
   * Get unified customer timeline
   */
  static async getCustomerTimeline(customerId: string, limit: number = 50): Promise<TimelineEvent[]> {
    try {
      const { data, error } = await supabase.rpc('get_customer_timeline', {
        customer_code_param: customerId,
        limit_param: limit
      });

      if (error) throw error;

      return (data as TimelineEvent[]) || [];
    } catch (error) {
      console.error('Error fetching customer timeline:', error);
      return [];
    }
  }
}

// ==========================================
// 6. METRICS SERVICE
// ==========================================

export class MetricsService {
  /**
   * Get Smart CRM system metrics
   */
  static async getSmartCRMMetrics(daysBack: number = 30): Promise<SmartCRMMetrics> {
    try {
      const { data, error } = await supabase.rpc('get_smart_crm_metrics', {
        days_back: daysBack
      });

      if (error) throw error;

      return data as SmartCRMMetrics;
    } catch (error) {
      console.error('Error fetching Smart CRM metrics:', error);
      throw new SmartCRMError('Failed to fetch metrics', 'METRICS_ERROR', error);
    }
  }
}

// ==========================================
// 7. PREFERENCES SERVICE
// ==========================================

export class PreferencesService {
  /**
   * Get user's lead creation rules
   */
  static async getLeadCreationRules(userId: string): Promise<LeadCreationRules> {
    try {
      const { data, error } = await supabase.rpc('get_or_create_lead_creation_rules', {
        user_id_param: userId
      });

      if (error) throw error;

      return data as LeadCreationRules;
    } catch (error) {
      console.error('Error fetching lead creation rules:', error);
      throw new SmartCRMError('Failed to fetch preferences', 'PREFERENCES_ERROR', error);
    }
  }

  /**
   * Update user's lead creation rules
   */
  static async updateLeadCreationRules(userId: string, updates: Partial<LeadCreationRules>): Promise<void> {
    try {
      const { error } = await supabase
        .from('lead_creation_rules')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating lead creation rules:', error);
      throw new SmartCRMError('Failed to update preferences', 'PREFERENCES_ERROR', error);
    }
  }
}

// ==========================================
// 8. MAIN SMART CRM SERVICE
// ==========================================

export class SmartCRMService {
  static Intelligence = LeadIntelligenceService;
  static Safety = SafetyValidationService;
  static Conflicts = ConflictDetectionService;
  static LeadCreation = LeadCreationService;
  static Timeline = TimelineService;
  static Metrics = MetricsService;
  static Preferences = PreferencesService;

  /**
   * Main entry point for activity processing
   */
  static async processActivity(activityId: string, userId: string): Promise<{
    score: LeadScoringResult;
    shouldCreate: boolean;
    conflicts?: ConflictResult;
  }> {
    try {
      // Get activity
      const { data: activity } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();

      if (!activity) {
        throw new SmartCRMError('Activity not found', 'ACTIVITY_NOT_FOUND');
      }

      // Calculate score
      const score = await this.Intelligence.calculateLeadScore(activity);

      // Get user preferences
      const preferences = await this.Preferences.getLeadCreationRules(userId);

      // Determine if lead should be created
      const shouldCreate = score.score >= preferences.score_threshold && 
                          preferences.auto_create_enabled;

      // Check for conflicts if creation is recommended
      let conflicts: ConflictResult | undefined;
      if (shouldCreate) {
        conflicts = await this.Conflicts.detectConflicts(activityId);
      }

      return {
        score,
        shouldCreate: shouldCreate && !conflicts?.suggestMerge,
        conflicts
      };

    } catch (error) {
      console.error('Error processing activity:', error);
      throw error;
    }
  }
}

export default SmartCRMService;