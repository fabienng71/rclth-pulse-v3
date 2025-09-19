
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import Navigation from '@/components/Navigation';
import CreditMemoTable from '@/components/reports/credit-memo/CreditMemoTable';
import CreditMemoFilters from '@/components/reports/credit-memo/CreditMemoFilters';
import { generateMonthOptions, formatDate } from '@/components/reports/credit-memo/utils/dateUtils';
import { formatCurrency } from '@/components/reports/credit-memo/utils/formatUtils';
import { useCreditMemoData } from '@/hooks/useCreditMemoData';

const CreditMemoReport = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Set default month to current month
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // Get month options for dropdown
  const monthOptions = generateMonthOptions();
  
  // Fetch credit memo data
  const { creditMemos, filteredMemos, setFilteredMemos, loading } = useCreditMemoData(selectedMonth);

  // Redirect if not fabien@repertoire.co.th
  useEffect(() => {
    if (user?.email !== 'fabien@repertoire.co.th') {
      navigate('/reports');
    }
  }, [user, navigate]);

  // Filter results when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMemos(creditMemos);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = creditMemos.filter(
        memo => 
          memo.customer_name?.toLowerCase().includes(searchLower) ||
          memo.customer_code?.toLowerCase().includes(searchLower) ||
          memo.document_no?.toLowerCase().includes(searchLower)
      );
      setFilteredMemos(filtered);
    }
  }, [searchTerm, creditMemos, setFilteredMemos]);

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/reports')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Credit Memo Report</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Credit Memo Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <CreditMemoFilters 
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              monthOptions={monthOptions}
            />
            <CreditMemoTable 
              creditMemos={filteredMemos} 
              loading={loading} 
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreditMemoReport;
