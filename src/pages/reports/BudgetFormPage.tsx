
import BudgetForm from "@/components/reports/budget/BudgetForm";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const BudgetFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['budget', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          budget_entries (
            month,
            amount
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      <main className="container py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{isEditMode ? "Edit Budget" : "Create Budget"}</h1>
        </div>
        <BudgetForm budgetData={budgetData} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default BudgetFormPage;
