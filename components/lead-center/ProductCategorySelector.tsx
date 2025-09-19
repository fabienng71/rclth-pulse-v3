import React, { useState, useEffect } from 'react';
import { Plus, Minus, Package, TrendingUp, DollarSign, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useProductInterests } from '@/hooks/useProductInterests';
import { ProductCategory, ProductItem, CategorySelectionData } from '@/types/productInterests';

interface ProductCategorySelectorProps {
  selectedCategories: CategorySelectionData[];
  onCategoriesChange: (categories: CategorySelectionData[]) => void;
  leadId?: string;
  customerChannel?: string;
}

export const ProductCategorySelector: React.FC<ProductCategorySelectorProps> = ({
  selectedCategories,
  onCategoriesChange,
  leadId,
  customerChannel,
}) => {
  const { toast } = useToast();
  const { categories, getItemsForCategory } = useProductInterests();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const addCategory = async (category: ProductCategory) => {
    if (selectedCategories.some(sc => sc.category.posting_group === category.posting_group)) {
      toast({
        title: "Category Already Added",
        description: `${category.description} is already in your selection.`,
        variant: "destructive",
      });
      return;
    }

    // Load real items for this category
    const items = await getItemsForCategory(category.posting_group);

    const newCategory: CategorySelectionData = {
      category,
      items,
      selectedItems: [],
      interestLevel: 'medium',
      estimatedVolume: undefined,
      priceSensitivity: 'medium',
      notes: '',
    };

    onCategoriesChange([...selectedCategories, newCategory]);
    setExpandedCategories(prev => new Set([...prev, category.posting_group]));
  };

  const removeCategory = (postingGroup: string) => {
    onCategoriesChange(selectedCategories.filter(sc => sc.category.posting_group !== postingGroup));
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.delete(postingGroup);
      return next;
    });
  };

  const updateCategory = (postingGroup: string, updates: Partial<CategorySelectionData>) => {
    onCategoriesChange(
      selectedCategories.map(sc =>
        sc.category.posting_group === postingGroup ? { ...sc, ...updates } : sc
      )
    );
  };

  const toggleItemSelection = (postingGroup: string, itemCode: string) => {
    const category = selectedCategories.find(sc => sc.category.posting_group === postingGroup);
    if (!category) return;

    const selectedItems = category.selectedItems.includes(itemCode)
      ? category.selectedItems.filter(id => id !== itemCode)
      : [...category.selectedItems, itemCode];

    updateCategory(postingGroup, { selectedItems });
  };

  const toggleCategoryExpansion = (postingGroup: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(postingGroup)) {
        next.delete(postingGroup);
      } else {
        next.add(postingGroup);
      }
      return next;
    });
  };

  const getInterestLevelColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const getPriceSensitivityIcon = (sensitivity?: 'high' | 'medium' | 'low') => {
    switch (sensitivity) {
      case 'high': return <DollarSign className="h-4 w-4 text-red-600" />;
      case 'medium': return <DollarSign className="h-4 w-4 text-yellow-600" />;
      case 'low': return <DollarSign className="h-4 w-4 text-green-600" />;
      default: return <DollarSign className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Category Interests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {categories.map((category) => (
              <Button
                key={category.posting_group}
                variant="outline"
                size="sm"
                onClick={() => addCategory(category)}
                disabled={selectedCategories.some(sc => sc.category.posting_group === category.posting_group)}
                className="justify-start"
              >
                <Plus className="h-3 w-3 mr-2" />
                {category.description}
              </Button>
            ))}
          </div>

          {/* Selected Categories */}
          <div className="space-y-4">
            {selectedCategories.map((categoryData) => (
              <Collapsible
                key={categoryData.category.posting_group}
                open={expandedCategories.has(categoryData.category.posting_group)}
                onOpenChange={() => toggleCategoryExpansion(categoryData.category.posting_group)}
              >
                <Card className="border-l-4 border-l-blue-500">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base">
                            {categoryData.category.description}
                          </CardTitle>
                          <Badge className={getInterestLevelColor(categoryData.interestLevel)}>
                            {categoryData.interestLevel}
                          </Badge>
                          {categoryData.selectedItems.length > 0 && (
                            <Badge variant="outline">
                              {categoryData.selectedItems.length} items
                            </Badge>
                          )}
                          {categoryData.estimatedVolume && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Volume2 className="h-3 w-3" />
                              {categoryData.estimatedVolume}/month
                            </div>
                          )}
                          {getPriceSensitivityIcon(categoryData.priceSensitivity)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCategory(categoryData.category.posting_group);
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Interest Configuration */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor={`interest-level-${categoryData.category.posting_group}`}>
                              Interest Level
                            </Label>
                            <Select
                              value={categoryData.interestLevel}
                              onValueChange={(value: 'high' | 'medium' | 'low') =>
                                updateCategory(categoryData.category.posting_group, { interestLevel: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High Interest</SelectItem>
                                <SelectItem value="medium">Medium Interest</SelectItem>
                                <SelectItem value="low">Low Interest</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor={`volume-${categoryData.category.posting_group}`}>
                              Estimated Monthly Volume
                            </Label>
                            <Input
                              id={`volume-${categoryData.category.posting_group}`}
                              type="number"
                              placeholder="Enter volume estimate"
                              value={categoryData.estimatedVolume || ''}
                              onChange={(e) =>
                                updateCategory(categoryData.category.posting_group, {
                                  estimatedVolume: e.target.value ? Number(e.target.value) : undefined
                                })
                              }
                            />
                          </div>

                          <div>
                            <Label htmlFor={`price-sensitivity-${categoryData.category.posting_group}`}>
                              Price Sensitivity
                            </Label>
                            <Select
                              value={categoryData.priceSensitivity || 'medium'}
                              onValueChange={(value: 'high' | 'medium' | 'low') =>
                                updateCategory(categoryData.category.posting_group, { priceSensitivity: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High Sensitivity</SelectItem>
                                <SelectItem value="medium">Medium Sensitivity</SelectItem>
                                <SelectItem value="low">Low Sensitivity</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Specific Items Selection */}
                        <div className="space-y-4">
                          <div>
                            <Label>Specific Items of Interest</Label>
                            <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                              {categoryData.items.map((item) => (
                                <div key={item.item_code} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`item-${item.item_code}`}
                                    checked={categoryData.selectedItems.includes(item.item_code)}
                                    onCheckedChange={() =>
                                      toggleItemSelection(categoryData.category.posting_group, item.item_code)
                                    }
                                  />
                                  <label
                                    htmlFor={`item-${item.item_code}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{item.description}</span>
                                      {item.unit_price && (
                                        <span className="text-muted-foreground">
                                          ฿{item.unit_price.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.item_code}
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`notes-${categoryData.category.posting_group}`}>
                              Notes
                            </Label>
                            <Textarea
                              id={`notes-${categoryData.category.posting_group}`}
                              placeholder="Additional notes about this category interest..."
                              value={categoryData.notes || ''}
                              onChange={(e) =>
                                updateCategory(categoryData.category.posting_group, { notes: e.target.value })
                              }
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          {selectedCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No product categories selected yet.</p>
              <p className="text-sm">Choose categories above to track lead interests.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};