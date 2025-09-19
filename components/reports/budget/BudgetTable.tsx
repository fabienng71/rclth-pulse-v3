
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { CreateBudgetDialog } from "./CreateBudgetDialog";
import { DeleteBudgetDialog } from "./DeleteBudgetDialog";
import BudgetSummaryCard from "./components/BudgetSummaryCard";
import BudgetEntriesTable from "./components/BudgetEntriesTable";
import { useBudgetData } from "./hooks/useBudgetData";

const BudgetTable = () => {
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<{ id: string; fiscalYear: string } | null>(null);
  const navigate = useNavigate();
  const { isAdmin, userId } = useAuthStore();
  const { budgets, isLoadingBudgets, salesData } = useBudgetData();

  const handleDeleteBudget = (id: string, fiscalYear: string) => {
    setBudgetToDelete({ id, fiscalYear });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Budget Overview</h2>
        <CreateBudgetDialog />
      </div>

      <BudgetSummaryCard 
        budgets={budgets} 
        salesData={salesData} 
        isLoading={isLoadingBudgets}
        onSelectBudget={setSelectedBudgetId}
        selectedBudgetId={selectedBudgetId}
        onDeleteBudget={handleDeleteBudget}
      />

      {selectedBudgetId && (
        <BudgetEntriesTable 
          entries={budgets?.find(b => b.id === selectedBudgetId)?.budget_entries || []}
          fiscalYear={budgets?.find(b => b.id === selectedBudgetId)?.fiscal_year || ''}
          currentSales={salesData?.[budgets?.find(b => b.id === selectedBudgetId)?.fiscal_year || '']?.total_turnover || 0}
        />
      )}

      {budgetToDelete && (
        <DeleteBudgetDialog
          isOpen={!!budgetToDelete}
          onClose={() => setBudgetToDelete(null)}
          budgetId={budgetToDelete.id}
          fiscalYear={budgetToDelete.fiscalYear}
        />
      )}
    </div>
  );
};

export default BudgetTable;
