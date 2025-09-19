import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getChannelInfo } from '@/utils/channelMapping';

interface ProductRecommendation {
  product: string;
  channels: string[];
  compatibility: number;
  volume: number;
}

interface ProductsTabProps {
  productRecommendations: ProductRecommendation[];
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  productRecommendations
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Product Recommendations by Channel</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productRecommendations.map((product, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{product.product}</h4>
                  <Badge variant="outline">{product.compatibility}% fit</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Market Volume</span>
                    <span>{product.volume} units/month</span>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Target Channels:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.channels.map(channel => (
                        <Badge key={channel} variant="outline" className="text-xs">
                          {getChannelInfo(channel)?.name || channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Progress value={product.compatibility} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};