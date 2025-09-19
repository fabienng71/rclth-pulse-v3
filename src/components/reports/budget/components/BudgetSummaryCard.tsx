
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatNumber } from "@/lib/utils";
import { useState } from "react";

interface BudgetEntry {
  month: string;
  amount: number;
}

interface Budget {
  id: string;
  fiscal_year: string;
  created_at: string;
  created_by: string;
  budget_entries?: BudgetEntry[];
}

interface SalesData {
  total_turnover: number;
}

interface BudgetSummaryCardProps {
  budgets: Budget[] | undefined;
  salesData: { [key: string]: SalesData } | undefined;
  isLoading: boolean;
  onSelectBudget: (id: string | null) => void;
  selectedBudgetId: string | null;
  onDeleteBudget: (id: string, fiscalYear: string) => void;
}

const BudgetSummaryCard = ({ 
  budgets, 
  salesData, 
  isLoading, 
  onSelectBudget, 
  selectedBudgetId,
  onDeleteBudget 
}: BudgetSummaryCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing Budgets</CardTitle>
        <CardDescription>Overview of all created budgets</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading budgets...</div>
        ) : budgets?.length === 0 ? (
          <div className="text-center py-4">No budgets found. Create your first budget to get started.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fiscal Year</TableHead>
                <TableHead>Total Budget</TableHead>
                <TableHead>Current Sales</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets?.map((budget) => {
                const totalBudget = budget.budget_entries?.reduce(
                  (sum, entry) => sum + (entry.amount || 0),
                  0
                ) || 0;

                const currentSales = salesData?.[budget.fiscal_year]?.total_turnover || 0;
                const progressPercentage = totalBudget > 0 
                  ? Math.round((currentSales / totalBudget) * 100) 
                  : 0;

                return (
                  <TableRow 
                    key={budget.id}
                    className="cursor-pointer hover:bg-muted/60"
                    onClick={() => onSelectBudget(budget.id === selectedBudgetId ? null : budget.id)}
                  >
                    <TableCell>{budget.fiscal_year}</TableCell>
                    <TableCell>{formatNumber(totalBudget)}</TableCell>
                    <TableCell>{formatNumber(currentSales)}</TableCell>
                    <TableCell>{progressPercentage}%</TableCell>
                    <TableCell>
                      {new Date(budget.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/reports/budget/edit/${budget.id}`);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBudget(budget.id, budget.fiscal_year);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetSummaryCard;
