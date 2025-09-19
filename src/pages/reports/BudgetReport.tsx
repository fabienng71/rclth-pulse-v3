
import Navigation from "@/components/Navigation";
import { useAuthStore } from "@/stores/authStore";
import { Navigate } from "react-router-dom";
import BudgetTable from "@/components/reports/budget/BudgetTable";

const BudgetReport = () => {
  const { isAdmin } = useAuthStore();

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      <main className="container py-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold md:text-3xl">Budget Management</h1>
          <BudgetTable />
        </div>
      </main>
    </div>
  );
};

export default BudgetReport;
