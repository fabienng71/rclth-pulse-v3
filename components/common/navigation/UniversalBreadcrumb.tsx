import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { CleanFragment } from '@/components/ui/clean-fragment';

interface UniversalBreadcrumbProps {
  className?: string;
  maxItems?: number;
}

const UniversalBreadcrumb: React.FC<UniversalBreadcrumbProps> = ({
  className = "mb-4",
  maxItems = 4
}) => {
  const navigate = useNavigate();
  const { breadcrumbs } = useNavigationHistory();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumb if we're at the root level
  }

  const shouldShowEllipsis = breadcrumbs.length > maxItems;
  const visibleCrumbs = shouldShowEllipsis 
    ? [breadcrumbs[0], ...breadcrumbs.slice(-(maxItems - 1))]
    : breadcrumbs;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          {visibleCrumbs.map((crumb, index) => {
            const isLast = index === visibleCrumbs.length - 1;
            const isFirst = index === 0;
            const showEllipsis = shouldShowEllipsis && index === 1 && !isFirst;

            return (
              <CleanFragment fragmentKey={crumb.path}>
                {showEllipsis && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbEllipsis />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="text-primary font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      onClick={() => handleNavigate(crumb.path)}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                
                {!isLast && <BreadcrumbSeparator />}
              </CleanFragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default UniversalBreadcrumb;