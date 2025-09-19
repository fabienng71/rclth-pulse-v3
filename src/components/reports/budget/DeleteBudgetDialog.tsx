
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteBudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId: string;
  fiscalYear: string;
}

export const DeleteBudgetDialog = ({
  isOpen,
  onClose,
  budgetId,
  fiscalYear,
}: DeleteBudgetDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteBudgetMutation = useMutation({
    mutationFn: async () => {
      // Delete budget entries first
      const { error: entriesError } = await supabase
        .from('budget_entries')
        .delete()
        .eq('budget_id', budgetId);

      if (entriesError) throw entriesError;

      // Then delete the budget
      const { error: budgetError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (budgetError) throw budgetError;
    },
    onSuccess: () => {
      toast({
        title: "Budget deleted",
        description: `Budget for FY ${fiscalYear} has been deleted successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting budget:', error);
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Budget</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the budget for FY {fiscalYear}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteBudgetMutation.mutate()}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
