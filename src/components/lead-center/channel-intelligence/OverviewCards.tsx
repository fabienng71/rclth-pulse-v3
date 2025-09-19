import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Award, DollarSign } from 'lucide-react';

interface ChannelMetrics {
  channel: string;
  channelName: string;
  leadsCount: number;
  avgScore: number;
  conversionRate: number;
  avgDealSize: number;
  avgSalesCycle: number;
  category: string;
}

interface OverviewCardsProps {
  channelMetrics: ChannelMetrics[];
  formatCurrency: (value: number) => string;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  channelMetrics,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Channels</p>
              <p className="text-2xl font-bold">{channelMetrics.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg AI Score</p>
              <p className="text-2xl font-bold">
                {Math.round(channelMetrics.reduce((sum, m) => sum + m.avgScore, 0) / channelMetrics.length || 0)}
              </p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Best Channel</p>
              <p className="text-lg font-bold">
                {channelMetrics[0]?.channelName || 'N/A'}
              </p>
            </div>
            <Award className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Deal Size</p>
              <p className="text-lg font-bold">
                {formatCurrency(channelMetrics.reduce((sum, m) => sum + m.avgDealSize, 0) / channelMetrics.length || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};