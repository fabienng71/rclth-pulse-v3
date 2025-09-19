import React, { useState, useEffect } from 'react';
import { Save, Package, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductCategorySelector } from './ProductCategorySelector';
import { useProductInterests } from '@/hooks/useProductInterests';
import { useToast } from '@/hooks/use-toast';
import { LeadCenter } from '@/types/leadCenter';
import { CategorySelectionData, LeadProductInterest } from '@/types/productInterests';

interface ProductInterestManagerProps {
  lead: LeadCenter;
  onInterestsChange?: (interests: LeadProductInterest[]) => void;
}

export const ProductInterestManager: React.FC<ProductInterestManagerProps> = ({
  lead,
  onInterestsChange,
}) => {
  const { toast } = useToast();
  const {
    interests,
    categories,
    categoryPerformance,
    isLoading,
    error,
    createInterest,
    updateInterest,
    deleteInterest,
    loadInterestsForLead,
    loadCategoryPerformance,
    getItemsForCategory,
  } = useProductInterests();

  const [selectedCategories, setSelectedCategories] = useState<CategorySelectionData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load interests and performance data when component mounts or lead changes
  useEffect(() => {
    if (lead.id) {
      loadInterestsForLead(lead.id);
      if (lead.customer_channel) {
        loadCategoryPerformance(lead.customer_channel);
      }
    }
  }, [lead.id, lead.customer_channel, loadInterestsForLead, loadCategoryPerformance]);

  // Convert database interests to UI format
  useEffect(() => {
    const convertInterestsToCategories = async () => {
      if (interests.length === 0) {
        setSelectedCategories([]);
        return;
      }

      const categoryData: CategorySelectionData[] = [];

      for (const interest of interests) {
        const category = categories.find(c => c.posting_group === interest.posting_group);
        if (!category) continue;

        // Load actual items for this category
        const items = await getItemsForCategory(interest.posting_group);

        categoryData.push({
          category,
          items,
          selectedItems: interest.specific_items || [],
          interestLevel: interest.interest_level,
          estimatedVolume: interest.estimated_monthly_volume,
          priceSensitivity: interest.price_sensitivity,
          notes: interest.notes,
        });
      }

      setSelectedCategories(categoryData);
      setHasChanges(false);
    };

    if (categories.length > 0 && interests.length > 0) {
      convertInterestsToCategories();
    } else if (interests.length === 0) {
      setSelectedCategories([]);
    }
  }, [interests, categories, getItemsForCategory]);

  // Track changes in category selection
  const handleCategoriesChange = (newCategories: CategorySelectionData[]) => {
    setSelectedCategories(newCategories);
    setHasChanges(true);
  };

  // Save changes to database
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Get current interests for comparison
      const currentInterestsByCategory = new Map(
        interests.map(interest => [interest.posting_group, interest])
      );

      const selectedCategoriesByGroup = new Map(
        selectedCategories.map(cat => [cat.category.posting_group, cat])
      );

      // Delete removed categories
      for (const interest of interests) {
        if (!selectedCategoriesByGroup.has(interest.posting_group)) {
          await deleteInterest(interest.id);
        }
      }

      // Update or create categories
      for (const categoryData of selectedCategories) {
        const postingGroup = categoryData.category.posting_group;
        const existingInterest = currentInterestsByCategory.get(postingGroup);

        const interestData = {
          lead_id: lead.id,
          posting_group: postingGroup,
          specific_items: categoryData.selectedItems,
          interest_level: categoryData.interestLevel,
          estimated_monthly_volume: categoryData.estimatedVolume,
          price_sensitivity: categoryData.priceSensitivity,
          notes: categoryData.notes,
        };

        if (existingInterest) {
          // Update existing interest
          await updateInterest(existingInterest.id, interestData);
        } else {
          // Create new interest
          await createInterest(interestData);
        }
      }

      setHasChanges(false);
      
      // Reload data to get updated interests
      await loadInterestsForLead(lead.id);
      
      if (onInterestsChange) {
        onInterestsChange(interests);
      }

      toast({
        title: "Product Interests Saved",
        description: "Lead product interests have been updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error Saving Interests",
        description: err.message || "Failed to save product interests.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get performance insights for selected categories
  const getCategoryPerformanceInsight = (postingGroup: string) => {
    if (!lead.customer_channel) return null;

    return categoryPerformance.find(
      perf => perf.posting_group === postingGroup && perf.customer_channel === lead.customer_channel
    );
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading && selectedCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Interests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product interests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Insights */}
      {categoryPerformance.length > 0 && lead.customer_channel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Category Performance for {lead.customer_channel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryPerformance
                .filter(perf => perf.customer_channel === lead.customer_channel)
                .sort((a, b) => b.performance_score - a.performance_score)
                .slice(0, 6)
                .map((perf) => (
                  <div key={perf.posting_group} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{perf.posting_group}</span>
                      <Badge 
                        variant={perf.performance_score >= 70 ? 'default' : perf.performance_score >= 40 ? 'secondary' : 'destructive'}
                      >
                        {Math.round(perf.performance_score)}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Conversion: {perf.conversion_rate.toFixed(1)}%</div>
                      <div>Avg Deal: {formatCurrency(perf.avg_deal_size)}</div>
                      <div>Cycle: {perf.sales_cycle_days} days</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Product Category Selector */}
      <ProductCategorySelector
        selectedCategories={selectedCategories}
        onCategoriesChange={handleCategoriesChange}
        leadId={lead.id}
        customerChannel={lead.customer_channel}
      />

      {/* Category Performance Insights */}
      {selectedCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedCategories.map((categoryData) => {
                const performance = getCategoryPerformanceInsight(categoryData.category.posting_group);
                if (!performance) return null;

                return (
                  <div key={categoryData.category.posting_group} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="font-medium">{categoryData.category.description}</span>
                      <p className="text-sm text-muted-foreground">{performance.recommendation}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {performance.conversion_rate.toFixed(1)}% conversion
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(performance.avg_deal_size)} avg deal
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Product Interests'}
          </Button>
        </div>
      )}
    </div>
  );
};