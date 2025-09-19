
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export type MonthlyBudget = {
  [key: string]: number;
};

export const useBudgetSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitBudget = async (fiscalYear: string, monthlyBudgets: MonthlyBudget) => {
    try {
      setIsSubmitting(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create budgets.",
          variant: "destructive",
        });
        return false;
      }

      // Insert the budget with the user ID
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          fiscal_year: fiscalYear,
          created_by: user.id,
        })
        .select()
        .single();

      if (budgetError) {
        console.error('Error creating budget:', budgetError);
        throw budgetError;
      }

      // Insert budget entries for each month
      const budgetEntries = Object.entries(monthlyBudgets).map(([month, amount]) => ({
        budget_id: budgetData.id,
        month,
        amount,
      }));

      const { error: entriesError } = await supabase
        .from('budget_entries')
        .insert(budgetEntries);

      if (entriesError) {
        console.error('Error creating budget entries:', entriesError);
        throw entriesError;
      }

      console.log('Budget submission successful');
      return true;
    } catch (error) {
      console.error('Error submitting budget:', error);
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBudget = async (budgetId: string, fiscalYear: string, monthlyBudgets: MonthlyBudget) => {
    try {
      setIsSubmitting(true);
      console.log('Updating budget:', budgetId, fiscalYear, monthlyBudgets);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to update budgets.",
          variant: "destructive",
        });
        return false;
      }
      
      // First verify that the budget exists and belongs to the current user
      const { data: budgetData, error: budgetCheckError } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .eq('created_by', user.id)
        .single();
      
      if (budgetCheckError || !budgetData) {
        console.error('Error checking budget ownership:', budgetCheckError);
        toast({
          title: "Error",
          description: "You don't have permission to update this budget.",
          variant: "destructive",
        });
        return false;
      }
      
      // Update the budget
      const { error: budgetError } = await supabase
        .from('budgets')
        .update({ fiscal_year: fiscalYear })
        .eq('id', budgetId);

      if (budgetError) {
        console.error('Error updating budget details:', budgetError);
        throw budgetError;
      }

      // Get existing entries for this budget
      const { data: existingEntries, error: fetchError } = await supabase
        .from('budget_entries')
        .select('id, month, amount')
        .eq('budget_id', budgetId);
        
      if (fetchError) {
        console.error('Error fetching existing entries:', fetchError);
        throw fetchError;
      }

      // Process month by month
      for (const [month, amount] of Object.entries(monthlyBudgets)) {
        // Check if this month already exists
        const existingEntry = existingEntries?.find(entry => entry.month === month);
        
        if (existingEntry) {
          // Update existing entry
          const { error: updateError } = await supabase
            .from('budget_entries')
            .update({ amount })
            .eq('id', existingEntry.id);
            
          if (updateError) {
            console.error(`Error updating entry for ${month}:`, updateError);
            throw updateError;
          }
        } else {
          // Insert new entry
          const { error: insertError } = await supabase
            .from('budget_entries')
            .insert({
              budget_id: budgetId,
              month,
              amount
            });
            
          if (insertError) {
            console.error(`Error inserting entry for ${month}:`, insertError);
            throw insertError;
          }
        }
      }
      
      // Delete entries that are no longer in the monthly budgets
      const monthsToKeep = Object.keys(monthlyBudgets);
      const entriesToDelete = existingEntries?.filter(entry => !monthsToKeep.includes(entry.month)) || [];
      
      if (entriesToDelete.length > 0) {
        const entryIdsToDelete = entriesToDelete.map(entry => entry.id);
        const { error: deleteError } = await supabase
          .from('budget_entries')
          .delete()
          .in('id', entryIdsToDelete);
          
        if (deleteError) {
          console.error('Error deleting entries:', deleteError);
          throw deleteError;
        }
      }

      console.log('Budget update completed successfully');
      return true;
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitBudget, updateBudget, isSubmitting };
};
