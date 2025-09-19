
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Plus, TrendingUp, ClipboardCheck, Calendar } from 'lucide-react';

interface QuickActionsSectionProps {
  isAdmin: boolean;
}

const actions = [
  {
    label: "Create Shipment",
    description: "Create a new shipment",
    icon: Plus,
    route: "/procurement/create",
    adminOnly: true,
    tooltip: "Only administrators can create shipments"
  },
  {
    label: "Create Claim",
    description: "Create a new claim",
    icon: ClipboardCheck,
    route: "/procurement/claim/create",
    adminOnly: true,
    tooltip: "Only administrators can create claims"
  },
  {
    label: "Create Forecast",
    description: "Create a new forecast",
    icon: TrendingUp,
    route: "/procurement/forecast/create",
    adminOnly: true,
    tooltip: "Only administrators can create forecasts"
  },
  {
    label: "Create Sales Forecast",
    description: "Create a sales forecast",
    icon: TrendingUp,
    route: "/procurement/create-sales-forecast",
    adminOnly: false,
    tooltip: "Create a sales forecast by vendor and item"
  },
  {
    label: "Manage Shipments",
    description: "View shipments timeline",
    icon: Calendar,
    route: "/procurement/shipments/timeline",
    adminOnly: false,
    tooltip: "View the shipments timeline"
  },
];

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ isAdmin }) => {
  const navigate = useNavigate();

  return (
    <Card variant="enhanced">
      <CardContent className="pt-4 pb-4">
        <TooltipProvider>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {actions.map((action, idx) => {
              const Icon = action.icon;
              const isDisabled = action.adminOnly && !isAdmin;
              return (
                <Tooltip key={action.label}>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      tabIndex={isDisabled ? -1 : 0}
                      aria-disabled={isDisabled}
                      onClick={() => {
                        if (!isDisabled) navigate(action.route);
                      }}
                      className={`
                        group w-full h-28 rounded-lg panel-background border
                        flex flex-col justify-center items-center transition-all
                        cursor-pointer relative
                        hover:shadow-md hover:scale-[1.03]
                        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-muted'}
                      `}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <span
                          className="
                            flex items-center justify-center
                            w-12 h-12 rounded-full bg-muted
                            transition-colors
                            group-hover:bg-muted-foreground/20
                          "
                        >
                          <Icon
                            className="h-7 w-7 text-black group-hover:text-gray-700 transition-colors"
                            strokeWidth={2.2}
                          />
                        </span>
                        <div className="text-center">
                          <div className="font-medium text-base">{action.label}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </div>
                      {isDisabled && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-xs text-muted-foreground">{action.tooltip}</span>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  {!isDisabled && (
                    <TooltipContent>
                      {action.description}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default QuickActionsSection;
