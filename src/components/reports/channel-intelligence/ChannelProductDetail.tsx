import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useChannelProductAnalysis } from '@/hooks/useChannelIntelligence';

interface ChannelProductDetailProps {
  channelCode: string;
  channelName: string;
  onBack: () => void;
  dateRange: { start_date: string; end_date: string };
}

export const ChannelProductDetail: React.FC<ChannelProductDetailProps> = ({ 
  channelCode, 
  channelName, 
  onBack, 
  dateRange 
}) => {
  const [productLimit, setProductLimit] = useState(5);
  
  const productAnalysis = useChannelProductAnalysis(
    channelCode,
    dateRange.start_date,
    dateRange.end_date,
    productLimit
  );

  if (productAnalysis.isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Channel Product Analysis</CardTitle>
              <CardDescription>Loading typical basket for {channelName}...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Typical Basket Analysis: {channelName}
              </CardTitle>
              <CardDescription>Top products most purchased by customers in this channel</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={productLimit.toString()} onValueChange={(value) => setProductLimit(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {productAnalysis.data?.map((product, index) => (
            <div key={product.item_code} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <h3 className="font-medium text-sm">{product.item_description}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{product.item_code}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatCurrency(product.total_revenue)}</div>
                  <div className="text-xs text-muted-foreground">Total Revenue</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Quantity Sold</p>
                  <p className="font-bold">{product.total_quantity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Transactions</p>
                  <p className="font-bold">{product.total_transactions}</p>
                  <p className="text-xs text-blue-600">{product.frequency_score.toFixed(1)}% frequency</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Price Range</p>
                  <p className="font-bold">{formatCurrency(product.lowest_price)} - {formatCurrency(product.highest_price)}</p>
                  <p className="text-xs text-muted-foreground">Avg: {formatCurrency(product.average_price)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Margin</p>
                  <p className="font-bold text-green-600">{product.average_margin_percent.toFixed(1)}%</p>
                  <p className="text-xs text-green-600">{formatCurrency(product.total_margin_dollars)} total</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Performance</p>
                  <Badge variant={product.frequency_score > 5 ? 'default' : 'secondary'}>
                    {product.frequency_score > 10 ? 'High' : product.frequency_score > 5 ? 'Medium' : 'Low'} Volume
                  </Badge>
                </div>
              </div>
            </div>
          )) || []}
        </div>
      </CardContent>
    </Card>
  );
};