import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBudgetSubmit } from "@/hooks/useBudgetSubmit";
import { useToast } from "@/components/ui/use-toast";
import { formatNumber } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface BudgetEntry {
  month: string;
  amount: number;
}

interface Budget {
  id: string;
  fiscal_year: string;
  created_at: string;
  budget_entries?: BudgetEntry[];
}

interface BudgetFormProps {
  budgetData?: Budget | null;
  isLoading?: boolean;
}

const BudgetForm = ({ budgetData, isLoading }: BudgetFormProps) => {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [monthlyBudgets, setMonthlyBudgets] = useState<{ [key: string]: number }>({});
  const { submitBudget, isSubmitting, updateBudget } = useBudgetSubmit();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isEditMode = !!budgetData;

  const fiscalYears = ["23/24", "24/25", "25/26", "26/27", "27/28", "28/29"];
  const months = [
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December", "January", "February", "March"
  ];

  useEffect(() => {
    if (budgetData && budgetData.budget_entries) {
      setSelectedYear(budgetData.fiscal_year);
      
      const budgetEntries: { [key: string]: number } = {};
      budgetData.budget_entries.forEach(entry => {
        budgetEntries[entry.month] = entry.amount;
      });
      
      setMonthlyBudgets(budgetEntries);
    }
  }, [budgetData]);

  const handleMonthlyBudgetChange = (month: string, value: string) => {
    const numValue = value === "" ? 0 : parseFloat(value);
    setMonthlyBudgets(prev => ({
      ...prev,
      [month]: numValue
    }));
  };

  const calculateTotal = () => {
    return Object.values(monthlyBudgets).reduce((sum, value) => sum + (value || 0), 0);
  };

  const handleSubmit = async () => {
    if (!selectedYear) {
      toast({
        title: "Error",
        description: "Please select a fiscal year",
        variant: "destructive"
      });
      return;
    }
    
    if (Object.values(monthlyBudgets).filter(value => value > 0).length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one monthly budget",
        variant: "destructive"
      });
      return;
    }
    
    if (isEditMode && budgetData) {
      const success = await updateBudget(budgetData.id, selectedYear, monthlyBudgets);
      if (success) {
        toast({
          title: "Budget Updated",
          description: `Budget for fiscal year ${selectedYear} has been updated successfully.`,
        });
        navigate('/reports/budget');
      }
    } else {
      const success = await submitBudget(selectedYear, monthlyBudgets);
      if (success) {
        toast({
          title: "Budget Created",
          description: `Budget for fiscal year ${selectedYear} has been created successfully.`,
        });
        navigate('/reports/budget');
        setSelectedYear("");
        setMonthlyBudgets({});
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading budget data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>Create and manage your annual budgets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fiscal-year">Fiscal Year</Label>
            <Select 
              value={selectedYear} 
              onValueChange={setSelectedYear} 
              disabled={isEditMode}
            >
              <SelectTrigger id="fiscal-year">
                <SelectValue placeholder="Select fiscal year" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedYear && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {months.map((month) => (
                  <div key={month} className="space-y-2">
                    <Label htmlFor={month}>{month}</Label>
                    <Input
                      id={month}
                      type="number"
                      placeholder="0"
                      value={monthlyBudgets[month] || ""}
                      onChange={(e) => handleMonthlyBudgetChange(month, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <Card className="p-4">
                <div className="text-lg font-semibold flex justify-between">
                  <span>Total Annual Budget:</span>
                  <span>{formatNumber(calculateTotal())}</span>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Budget" : "Create Budget")}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetForm;
