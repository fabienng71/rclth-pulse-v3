import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { activityFormSchema, ActivityFormData } from './formSchema';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { useLeadCreation, useLeadCreationRules } from '@/hooks/useSmartCRM';
import { ActivityFormDataEnhanced } from '@/types/smartCRM';

/**
 * Validates that adding a parent activity won't create a cycle in the activity chain
 * @param proposedParentId - The ID of the proposed parent activity
 * @param currentActivityId - The ID of the current activity (null for new activities)
 * @returns Promise<boolean> - true if a cycle would be created, false otherwise
 */
const validateActivityChainForCycles = async (
  proposedParentId: string, 
  currentActivityId: string | null
): Promise<boolean> => {
  console.log(`🔍 Starting cycle detection: proposed parent ${proposedParentId}, current activity ${currentActivityId}`);
  
  // Track visited activities to detect cycles
  const visited = new Set<string>();
  
  // If we have a current activity, add it to visited to prevent cycles back to it
  if (currentActivityId) {
    visited.add(currentActivityId);
  }
  
  let currentParentId: string | null = proposedParentId;
  let stepCount = 0;
  const maxSteps = 100; // Circuit breaker to prevent infinite loops from bad data
  
  while (currentParentId && stepCount < maxSteps) {
    console.log(`  Step ${stepCount + 1}: Checking activity ${currentParentId}`);
    
    // If we've seen this activity before, we have a cycle
    if (visited.has(currentParentId)) {
      console.log(`  ❌ Cycle detected at activity ${currentParentId}`);
      return true;
    }
    
    // Mark this activity as visited
    visited.add(currentParentId);
    
    try {
      // Fetch the parent activity to get its parent_activity_id
      const { data: parentActivity, error } = await supabase
        .from('activities')
        .select('parent_activity_id')
        .eq('id', currentParentId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Activity not found - this is fine, chain ends here
          console.log(`  ✅ Activity ${currentParentId} not found, chain ends`);
          break;
        } else {
          // Other database error
          console.error(`  ❌ Database error checking activity ${currentParentId}:`, error);
          throw new Error(`Database error during cycle detection: ${error.message}`);
        }
      }
      
      // Move to the next parent in the chain
      currentParentId = parentActivity?.parent_activity_id || null;
      stepCount++;
      
      if (!currentParentId) {
        console.log(`  ✅ Reached root of chain at step ${stepCount}`);
      }
    } catch (dbError) {
      console.error(`  ❌ Error fetching parent activity ${currentParentId}:`, dbError);
      throw dbError;
    }
  }
  
  if (stepCount >= maxSteps) {
    console.warn(`  ⚠️ Hit maximum step limit (${maxSteps}) during cycle detection`);
    // Don't treat this as a cycle, but log it for investigation
    return false;
  }
  
  console.log(`  ✅ No cycle detected after ${stepCount} steps`);
  return false;
};

export const useActivityForm = (activityId?: string, prefilledData?: Partial<ActivityFormData>) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getBackPath } = useNavigationHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null);
  const [activityDataLoaded, setActivityDataLoaded] = useState(false);
  
  // Smart CRM hooks
  const { createLeadFromActivity, isCreating } = useLeadCreation();
  const { rules: leadCreationRules } = useLeadCreationRules();

  console.log('=== useActivityForm INITIALIZATION ===');
  console.log('activityId:', activityId);
  console.log('prefilledData:', prefilledData);
  console.log('user:', user);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  console.log('Today date for default:', today);

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      entity_type: 'customer',
      pipeline_stage: 'Lead',
      activity_type: 'Meeting',
      activity_date: today, // Set default to today's date
      salesperson_id: activityId ? '' : (user?.id || ''), // Only set current user for new activities
      salesperson_name: '', // Will be populated when profile loads or activity fetches
      ...prefilledData,
    },
  });

  console.log('Form default values set:', form.getValues());

  // Synchronize is_lead boolean with entity_type string
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'is_lead') {
        const isLead = value.is_lead;
        const currentEntityType = value.entity_type;
        
        console.log('is_lead changed:', isLead, 'current entity_type:', currentEntityType);
        
        if (isLead === true && currentEntityType !== 'lead') {
          console.log('Setting entity_type to "lead"');
          form.setValue('entity_type', 'lead');
        } else if (isLead === false && currentEntityType !== 'customer') {
          console.log('Setting entity_type to "customer"');
          form.setValue('entity_type', 'customer');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Fetch current user's profile data (only for new activities)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      // Only fetch user profile for new activities, not when editing existing ones
      if (activityId) {
        console.log('Skipping user profile fetch - editing existing activity');
        return;
      }

      // Don't override if activity data has already been loaded
      if (activityDataLoaded) {
        console.log('Skipping user profile fetch - activity data already loaded');
        return;
      }

      try {
        console.log('Fetching user profile for new activity:', user.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to user metadata if profile fetch fails
          const fallbackName = user.user_metadata?.full_name || '';
          setUserProfile({ full_name: fallbackName });
          form.setValue('salesperson_name', fallbackName);
          console.log('Using fallback name:', fallbackName);
        } else if (profile) {
          console.log('Profile fetched successfully:', profile);
          setUserProfile(profile);
          form.setValue('salesperson_name', profile.full_name || '');
          console.log('Set salesperson_name to:', profile.full_name);
        }
      } catch (err) {
        console.error('Error in fetchUserProfile:', err);
        // Final fallback
        const fallbackName = user.user_metadata?.full_name || '';
        setUserProfile({ full_name: fallbackName });
        form.setValue('salesperson_name', fallbackName);
      }
    };

    fetchUserProfile();
  }, [user?.id, form, activityId, activityDataLoaded]);

  // Log form validation state changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      console.log('=== FORM VALUES CHANGED ===');
      console.log('Current values:', values);
      console.log('Form validation state:', {
        isValid: form.formState.isValid,
        errors: form.formState.errors,
        isDirty: form.formState.isDirty,
      });
      
      // Check specific field validation
      const requiredFields = {
        activity_date: values.activity_date,
        activity_type: values.activity_type,
        salesperson_id: values.salesperson_id,
        salesperson_name: values.salesperson_name,
        entity_type: values.entity_type,
        customer_code: values.entity_type === 'customer' ? values.customer_code : 'N/A',
        customer_name: values.entity_type === 'customer' ? values.customer_name : 'N/A',
        lead_id: values.entity_type === 'lead' ? values.lead_id : 'N/A',
        lead_name: values.entity_type === 'lead' ? values.lead_name : 'N/A',
      };
      
      console.log('Required fields check:', requiredFields);
      
      // Log which fields are empty/invalid
      Object.entries(requiredFields).forEach(([field, value]) => {
        if (!value || value === '') {
          console.log(`❌ Field '${field}' is empty:`, value);
        } else {
          console.log(`✅ Field '${field}' has value:`, value);
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Sync salesperson_name when salesperson_id changes (for manual selections)
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === 'salesperson_id' && values.salesperson_id) {
        const currentName = values.salesperson_name;
        
        // Only update if the name is empty or doesn't match the ID
        if (!currentName || currentName === '') {
          console.log('Syncing salesperson_name for ID:', values.salesperson_id);
          
          // Fetch the salesperson name from profiles
          const fetchSalespersonName = async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', values.salesperson_id)
                .single();
              
              if (profile?.full_name) {
                console.log('Setting salesperson_name via sync:', profile.full_name);
                form.setValue('salesperson_name', profile.full_name);
              }
            } catch (error) {
              console.warn('Failed to fetch salesperson name:', error);
            }
          };
          
          fetchSalespersonName();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (activityId) {
      console.log('Fetching activity for edit mode:', activityId);
      fetchActivity(activityId);
    }
  }, [activityId]);

  const fetchActivity = async (id: string) => {
    console.log('=== FETCHING ACTIVITY ===');
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Fetch activity error:', error);
        throw error;
      }

      console.log('Fetched activity data:', data);

      if (data) {
        const formData: ActivityFormData = {
          activity_date: data.activity_date,
          activity_type: data.activity_type || 'Meeting',
          entity_type: data.is_lead ? 'lead' : 'customer',
          customer_code: data.customer_code || '',
          customer_name: data.customer_name || '',
          lead_id: data.lead_id || '',
          lead_name: data.lead_name || '',
          contact_name: data.contact_name || '',
          salesperson_id: data.salesperson_id || '',
          salesperson_name: data.salesperson_name || '',
          notes: data.notes || '',
          follow_up_date: data.follow_up_date || '',
          sample_request_id: data.sample_request_id || '',
          project_id: data.project_id || '',
          parent_activity_id: data.parent_activity_id || '',
          pipeline_stage: data.pipeline_stage || 'Lead',
        };

        console.log('Setting form data:', formData);
        form.reset(formData);
        setActivityDataLoaded(true); // Mark that activity data has been loaded
        console.log('Activity data loaded, salesperson protection enabled');
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError('Failed to load activity');
      toast.error('Failed to load activity');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ActivityFormData | ActivityFormDataEnhanced) => {
    console.log('=== ACTIVITY FORM SUBMISSION START ===');
    console.log('Form submission started with data:', data);
    console.log('Form validation state:', form.formState);
    console.log('Form errors:', form.formState.errors);
    
    setIsSubmitting(true);
    setError(null);
    
    // Check if this is Smart CRM enhanced data
    const enhancedData = data as ActivityFormDataEnhanced;
    const isSmartCRMRequest = enhancedData.create_lead && enhancedData.lead_title;
    
    console.log('🎯 Smart CRM detection:', {
      create_lead: enhancedData.create_lead,
      lead_title: enhancedData.lead_title,
      lead_score: enhancedData.lead_score,
      isSmartCRMRequest
    });

    try {
      // Enhanced validation with detailed logging
      console.log('=== FORM VALIDATION ===');
      
      if (!data.activity_date) {
        console.error('❌ Validation failed: Activity date is required');
        console.log('Current activity_date value:', data.activity_date);
        toast.error('Activity date is required');
        return;
      }
      console.log('✅ Activity date validation passed:', data.activity_date);
      
      if (!data.activity_type) {
        console.error('❌ Validation failed: Activity type is required');
        console.log('Current activity_type value:', data.activity_type);
        toast.error('Activity type is required');
        return;
      }
      console.log('✅ Activity type validation passed:', data.activity_type);

      if (!data.salesperson_id) {
        console.error('❌ Validation failed: Salesperson is required');
        console.log('Current salesperson_id value:', data.salesperson_id);
        toast.error('Salesperson is required');
        return;
      }
      console.log('✅ Salesperson validation passed:', data.salesperson_id);

      // Validate entity selection
      if (data.entity_type === 'customer') {
        if (!data.customer_code || !data.customer_name) {
          console.error('❌ Validation failed: Customer selection incomplete', {
            customer_code: data.customer_code,
            customer_name: data.customer_name
          });
          toast.error('Please select a customer');
          return;
        }
        console.log('✅ Customer validation passed:', {
          customer_code: data.customer_code,
          customer_name: data.customer_name
        });
      }

      if (data.entity_type === 'lead') {
        if (!data.lead_id || !data.lead_name) {
          console.error('❌ Validation failed: Lead selection incomplete', {
            lead_id: data.lead_id,
            lead_name: data.lead_name
          });
          toast.error('Please select a lead');
          return;
        }
        console.log('✅ Lead validation passed:', {
          lead_id: data.lead_id,
          lead_name: data.lead_name
        });
      }

      // Validate parent activity (prevent cycles)
      if (data.parent_activity_id) {
        console.log('🔍 Validating parent activity chain for cycles...');
        
        // Quick check for direct self-reference (performance optimization)
        if (data.parent_activity_id === activityId) {
          console.error('❌ Validation failed: Cannot reference self as parent activity');
          toast.error('Cannot reference this activity as its own parent');
          return;
        }
        
        // Comprehensive cycle detection for deeper chains
        try {
          const hasCycle = await validateActivityChainForCycles(data.parent_activity_id, activityId || null);
          if (hasCycle) {
            console.error('❌ Validation failed: Activity chain would create a cycle');
            toast.error('Cannot create this parent relationship as it would create a circular reference in the activity chain');
            return;
          }
          console.log('✅ Parent activity chain validation passed - no cycles detected');
        } catch (cycleError) {
          console.error('❌ Error during cycle detection:', cycleError);
          // Fallback: Allow the operation but log the issue
          console.warn('⚠️ Cycle detection failed, proceeding with caution');
          toast.warning('Unable to fully validate activity chain. Please ensure no circular references exist.');
        }
      }

      console.log('✅ All validations passed');

      // Get salesperson name from user profile if not set
      let salespersonName = data.salesperson_name;
      if (!salespersonName && data.salesperson_id) {
        console.log('Fetching salesperson name from profile...');
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.salesperson_id)
          .single();
        
        salespersonName = profile?.full_name || '';
        console.log('Salesperson name fetched:', salespersonName);
      }

      const activityData = {
        activity_date: data.activity_date,
        activity_type: data.activity_type,
        customer_code: data.entity_type === 'customer' ? data.customer_code : null,
        customer_name: data.entity_type === 'customer' ? data.customer_name : null,
        lead_id: data.entity_type === 'lead' ? data.lead_id : null,
        lead_name: data.entity_type === 'lead' ? data.lead_name : null,
        is_lead: data.entity_type === 'lead',
        contact_name: data.contact_name || null,
        salesperson_id: data.salesperson_id,
        salesperson_name: salespersonName,
        notes: data.notes || null,
        follow_up_date: data.follow_up_date || null,
        sample_request_id: data.sample_request_id || null,
        project_id: data.project_id || null,
        parent_activity_id: data.parent_activity_id || null,
        pipeline_stage: data.pipeline_stage,
      };

      console.log('=== DATABASE OPERATION ===');
      console.log('Prepared activity data for submission:', activityData);

      let finalActivityId = activityId;

      if (activityId) {
        console.log('🔄 Updating existing activity...');
        const { error } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', activityId);

        if (error) {
          console.error('❌ Update error:', error);
          throw error;
        }
        console.log('✅ Activity updated successfully');
        toast.success('Activity updated successfully');
      } else {
        console.log('🆕 Creating new activity...');
        const { data: result, error } = await supabase
          .from('activities')
          .insert([activityData])
          .select();

        if (error) {
          console.error('❌ Insert error:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        
        console.log('✅ Activity created successfully:', result);
        toast.success('Activity created successfully');
        
        // Set the final activity ID for lead creation
        finalActivityId = result?.[0]?.id;
      }

      // Smart CRM: Handle lead creation if requested (works for both create and edit)
      const enhancedData = data as ActivityFormDataEnhanced;
      if (enhancedData.create_lead && enhancedData.lead_title && finalActivityId) {
        console.log('🎯 Smart CRM: Creating lead from activity...');
        
        try {
          if (!leadCreationRules) {
            console.warn('⚠️ Lead creation rules not available, using defaults');
          }
          
          const leadCreationResult = await createLeadFromActivity({
            activityId: finalActivityId,
            score: enhancedData.lead_score || 0,
            leadTitle: enhancedData.lead_title,
            userPreferences: leadCreationRules || {
              id: '',
              user_id: user?.id || '',
              activity_types: ['Meeting', 'Demo', 'Proposal Presentation'],
              pipeline_stages: ['Qualified', 'Proposal'],
              keyword_triggers: ['interested', 'opportunity', 'budget'],
              score_threshold: 60,
              auto_create_enabled: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            overrideSafety: enhancedData.override_safety || false
          });
          
          if (leadCreationResult.success) {
            console.log('✅ Smart CRM: Lead created successfully:', leadCreationResult);
            toast.success(`Lead "${enhancedData.lead_title}" created and linked to activity`);
          } else {
            console.warn('⚠️ Smart CRM: Lead creation failed:', leadCreationResult.error);
            toast.warning(`Activity ${activityId ? 'updated' : 'created'}, but lead creation failed: ${leadCreationResult.error}`);
          }
        } catch (leadError) {
          console.error('❌ Smart CRM: Error during lead creation:', leadError);
          toast.warning(`Activity ${activityId ? 'updated' : 'created'}, but lead creation encountered an error: ${leadError instanceof Error ? leadError.message : 'Unknown error'}`);
        }
      }

      console.log('🏃‍♂️ Navigating back with context...');
      // Use context-aware navigation or fallback to activities list
      const { path } = getBackPath();
      navigate(path);
    } catch (err) {
      console.error('=== ❌ ERROR IN ACTIVITY SUBMISSION ===');
      console.error('Error details:', err);
      console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack');
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to save activity: ${errorMessage}`);
      toast.error(`Failed to save activity: ${errorMessage}`);
    } finally {
      console.log('=== ACTIVITY FORM SUBMISSION END ===');
      setIsSubmitting(false);
    }
  };

  const handleEntityTypeChange = (entityType: 'customer' | 'lead') => {
    console.log('🔄 Entity type changed to:', entityType);
    // Clear the other entity's data when switching
    if (entityType === 'customer') {
      form.setValue('lead_id', '');
      form.setValue('lead_name', '');
      console.log('Cleared lead data');
    } else {
      form.setValue('customer_code', '');
      form.setValue('customer_name', '');
      console.log('Cleared customer data');
    }
  };

  return {
    form,
    isLoading,
    error,
    isSubmitting,
    onSubmit,
    handleEntityTypeChange,
  };
};
