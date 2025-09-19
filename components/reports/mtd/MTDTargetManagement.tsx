import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Edit, Save, X, Plus } from 'lucide-react';
import { useSalesTargets } from '@/hooks/useSalesTargets';
import { useAuthStore } from '@/stores/authStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface MTDTargetManagementProps {
  selectedYear: number;
  selectedMonth: number;
  selectedSalesperson: string;
  currentSalesAmount: number;
  isLoading?: boolean;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MTDTargetManagement: React.FC<MTDTargetManagementProps> = ({
  selectedYear,
  selectedMonth,
  selectedSalesperson,
  currentSalesAmount,
  isLoading = false,
}) => {
  const { isAdmin } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [targetAmount, setTargetAmount] = useState('');
  const [tempTargetAmount, setTempTargetAmount] = useState('');

  const { targets, saveTargets, isSaving } = useSalesTargets(selectedYear, selectedMonth);

  // Find the current target for the selected salesperson
  const currentTarget = targets?.find(t => t.salesperson_code === selectedSalesperson);

  useEffect(() => {
    if (currentTarget) {
      setTargetAmount(currentTarget.target_amount.toString());
      setTempTargetAmount(currentTarget.target_amount.toString());
    } else {
      setTargetAmount('0');
      setTempTargetAmount('0');
    }
  }, [currentTarget]);

  const handleEditClick = () => {
    setTempTargetAmount(targetAmount);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setTempTargetAmount(targetAmount);
    setIsEditing(false);
  };

  const handleSaveTarget = async () => {
    try {
      const newTargetAmount = parseFloat(tempTargetAmount) || 0;
      
      if (newTargetAmount < 0) {
        toast({
          title: "Invalid Target",
          description: "Target amount cannot be negative.",
          variant: "destructive",
        });
        return;
      }

      // Get existing targets and update or add the current one
      const existingTargets = targets || [];
      const updatedTargets = existingTargets.filter(t => t.salesperson_code !== selectedSalesperson);
      
      if (newTargetAmount > 0) {
        updatedTargets.push({
          salesperson_code: selectedSalesperson,
          month: selectedMonth,
          year: selectedYear,
          target_amount: newTargetAmount,
        });
      }

      await saveTargets(updatedTargets);
      setTargetAmount(newTargetAmount.toString());
      setIsEditing(false);
      
      toast({
        title: "Target Updated",
        description: `Sales target updated to ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(newTargetAmount)}`,
      });
    } catch (error) {
      console.error('Error saving target:', error);
      toast({
        title: "Error",
        description: "Failed to save target. Please try again.",
        variant: "destructive",
      });
    }
  };

  const achievementPercent = currentTarget && currentTarget.target_amount > 0
    ? (currentSalesAmount / currentTarget.target_amount) * 100
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAchievementColor = (percent: number) => {
    if (percent >= 100) return 'text-green-600';
    if (percent >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Only show for specific salesperson (not 'all')
  if (selectedSalesperson === 'all') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Sales Target Management - {months[selectedMonth - 1]} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Select a specific salesperson to view and edit their sales target. 
              Target management requires a specific salesperson to be selected.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Sales Target Management - {months[selectedMonth - 1]} {selectedYear}
          <span className="text-sm font-normal text-muted-foreground">
            ({selectedSalesperson})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Target Amount Card */}
              <div className="border rounded-lg p-4">
                <Label className="text-sm font-medium text-muted-foreground">Target Amount</Label>
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <Input
                      type="number"
                      value={tempTargetAmount}
                      onChange={(e) => setTempTargetAmount(e.target.value)}
                      placeholder="Enter target amount"
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveTarget}
                        disabled={isSaving}
                        className="flex items-center gap-1"
                      >
                        <Save className="h-3 w-3" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatCurrency(parseFloat(targetAmount))}
                    </span>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditClick}
                        disabled={isLoading}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Current Sales Card */}
              <div className="border rounded-lg p-4">
                <Label className="text-sm font-medium text-muted-foreground">Current Sales</Label>
                <div className="mt-2">
                  <span className="text-2xl font-bold">
                    {formatCurrency(currentSalesAmount)}
                  </span>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedSalesperson} MTD
                  </div>
                </div>
              </div>

              {/* Achievement Card */}
              <div className="border rounded-lg p-4">
                <Label className="text-sm font-medium text-muted-foreground">Achievement</Label>
                <div className="mt-2">
                  <span className={`text-2xl font-bold ${getAchievementColor(achievementPercent)}`}>
                    {achievementPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Target</span>
                <span>{achievementPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    achievementPercent >= 100 ? 'bg-green-500' :
                    achievementPercent >= 75 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(achievementPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>Target: {formatCurrency(parseFloat(targetAmount))}</span>
              </div>
            </div>

            {/* Target Status */}
            <div className="text-sm text-muted-foreground">
              {achievementPercent >= 100 ? (
                <span className="text-green-600 font-medium">🎯 Target achieved!</span>
              ) : (
                <span>
                  Remaining: {formatCurrency(parseFloat(targetAmount) - currentSalesAmount)}
                </span>
              )}
            </div>
          </div>
      </CardContent>
    </Card>
  );
};