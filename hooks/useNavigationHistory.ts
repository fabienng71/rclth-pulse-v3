import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

interface NavigationState {
  from?: string;
  fromLabel?: string;
}

export const useNavigationHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get navigation state from current location
  const navigationState = location.state as NavigationState | null;

  // Determine the back navigation path based on current location and state
  const getBackPath = useCallback((): { path: string; label: string } => {
    // If we have explicit navigation state, use it
    if (navigationState?.from) {
      return {
        path: navigationState.from,
        label: navigationState.fromLabel || 'Back'
      };
    }

    // Fallback logic based on current path
    const pathname = location.pathname;

    // PROCUREMENT ROUTES
    if (pathname.startsWith('/procurement/shipments/') && pathname.includes('/todo')) {
      return { path: '/procurement/shipments/timeline', label: 'Back to Timeline' };
    }
    
    if (pathname.match(/^\/procurement\/[a-f0-9-]+$/)) {
      // This is a shipment details page - default to dashboard if no context
      return { path: '/procurement', label: 'Back to Dashboard' };
    }
    
    if (pathname.startsWith('/procurement/forecasts/')) {
      return { path: '/procurement/forecasts', label: 'Back to Forecasts' };
    }
    
    if (pathname.startsWith('/procurement/sales-forecasts/')) {
      return { path: '/procurement/sales-forecasts', label: 'Back to Sales Forecasts' };
    }

    if (pathname.startsWith('/procurement')) {
      return { path: '/procurement', label: 'Back to Dashboard' };
    }

    // CRM ROUTES
    if (pathname.startsWith('/crm/contacts/') && pathname.includes('/edit')) {
      return { path: pathname.replace('/edit', ''), label: 'Back to Contact' };
    }
    
    if (pathname.match(/^\/crm\/contacts\/[a-f0-9-]+$/)) {
      return { path: '/crm/contacts', label: 'Back to Contacts' };
    }
    
    if (pathname.startsWith('/crm/contacts/create')) {
      return { path: '/crm/contacts', label: 'Back to Contacts' };
    }

    if (pathname.startsWith('/crm/leads/') && pathname.includes('/edit')) {
      return { path: pathname.replace('/edit', ''), label: 'Back to Lead' };
    }
    
    if (pathname.startsWith('/crm/leads/') && pathname.includes('/ai-research')) {
      return { path: pathname.replace('/ai-research', ''), label: 'Back to Lead' };
    }
    
    if (pathname.match(/^\/crm\/leads\/[a-f0-9-]+$/)) {
      return { path: '/crm/leads', label: 'Back to Leads' };
    }
    
    if (pathname.startsWith('/crm/leads/create')) {
      return { path: '/crm/leads', label: 'Back to Leads' };
    }

    if (pathname.startsWith('/crm/activities/new') || pathname.startsWith('/crm/activity/new')) {
      return { path: '/crm/activities', label: 'Back to Activities' };
    }
    
    if (pathname.match(/^\/crm\/activity\/[a-f0-9-]+$/)) {
      return { path: '/crm/activities', label: 'Back to Activities' };
    }
    
    if (pathname.startsWith('/crm/activities/pipeline/')) {
      return { path: '/crm/activities', label: 'Back to Activities' };
    }

    if (pathname.startsWith('/crm/followups')) {
      return { path: '/crm/activities', label: 'Back to Activities' };
    }

    if (pathname.startsWith('/crm')) {
      return { path: '/crm', label: 'Back to CRM' };
    }

    // Default fallback
    return { path: '/', label: 'Back to Home' };
  }, [location, navigationState]);

  // Navigate with context
  const navigateWithContext = useCallback((
    to: string, 
    options?: { 
      fromLabel?: string;
      replace?: boolean;
    }
  ) => {
    const state: NavigationState = {
      from: location.pathname,
      fromLabel: options?.fromLabel
    };

    navigate(to, { 
      state,
      replace: options?.replace 
    });
  }, [location.pathname, navigate]);

  // Go back with context awareness
  const goBack = useCallback(() => {
    const { path } = getBackPath();
    navigate(path);
  }, [getBackPath, navigate]);

  // Generate breadcrumbs based on current path
  const breadcrumbs = useMemo(() => {
    const pathname = location.pathname;
    let crumbs: { label: string; path: string }[] = [];

    // PROCUREMENT BREADCRUMBS
    if (pathname.startsWith('/procurement')) {
      crumbs = [{ label: 'Procurement', path: '/procurement' }];

      if (pathname === '/procurement') return crumbs;

      if (pathname.startsWith('/procurement/shipments')) {
        if (pathname === '/procurement/shipments') {
          crumbs.push({ label: 'Shipments', path: '/procurement/shipments' });
        } else if (pathname === '/procurement/shipments/timeline') {
          crumbs.push({ label: 'Timeline', path: '/procurement/shipments/timeline' });
        } else if (pathname.includes('/todo')) {
          crumbs.push({ label: 'Timeline', path: '/procurement/shipments/timeline' });
          crumbs.push({ label: 'Todo Tasks', path: pathname });
        } else {
          const shipmentId = pathname.split('/').pop();
          crumbs.push({ label: 'Shipments', path: '/procurement/shipments' });
          crumbs.push({ label: `Shipment ${shipmentId?.slice(0, 8)}...`, path: pathname });
        }
      } else if (pathname.startsWith('/procurement/incoming-stock')) {
        crumbs.push({ label: 'Incoming Stock', path: '/procurement/incoming-stock' });
      } else if (pathname.startsWith('/procurement/forecasts')) {
        if (pathname === '/procurement/forecasts') {
          crumbs.push({ label: 'Forecasts', path: '/procurement/forecasts' });
        } else {
          const forecastId = pathname.split('/').pop();
          crumbs.push({ label: 'Forecasts', path: '/procurement/forecasts' });
          crumbs.push({ label: `Forecast ${forecastId?.slice(0, 8)}...`, path: pathname });
        }
      } else if (pathname.startsWith('/procurement/sales-forecasts')) {
        crumbs.push({ label: 'Sales Forecasts', path: '/procurement/sales-forecasts' });
      } else if (pathname.includes('/create')) {
        if (pathname.includes('/claim/create')) {
          crumbs.push({ label: 'Create Claim', path: pathname });
        } else if (pathname.includes('/forecast/create')) {
          crumbs.push({ label: 'Create Forecast', path: pathname });
        } else if (pathname === '/procurement/create') {
          crumbs.push({ label: 'Create Shipment', path: pathname });
        }
      }
    }
    
    // CRM BREADCRUMBS
    else if (pathname.startsWith('/crm')) {
      crumbs = [{ label: 'CRM', path: '/crm' }];

      if (pathname === '/crm') return crumbs;

      if (pathname.startsWith('/crm/contacts')) {
        if (pathname === '/crm/contacts') {
          crumbs.push({ label: 'Contacts', path: '/crm/contacts' });
        } else if (pathname === '/crm/contacts/create') {
          crumbs.push({ label: 'Contacts', path: '/crm/contacts' });
          crumbs.push({ label: 'Create Contact', path: pathname });
        } else if (pathname.includes('/edit')) {
          const contactId = pathname.split('/')[3];
          crumbs.push({ label: 'Contacts', path: '/crm/contacts' });
          crumbs.push({ label: `Contact ${contactId?.slice(0, 8)}...`, path: `/crm/contacts/${contactId}` });
          crumbs.push({ label: 'Edit', path: pathname });
        } else {
          const contactId = pathname.split('/').pop();
          crumbs.push({ label: 'Contacts', path: '/crm/contacts' });
          crumbs.push({ label: `Contact ${contactId?.slice(0, 8)}...`, path: pathname });
        }
      } else if (pathname.startsWith('/crm/leads')) {
        if (pathname === '/crm/leads') {
          crumbs.push({ label: 'Leads', path: '/crm/leads' });
        } else if (pathname === '/crm/leads/create') {
          crumbs.push({ label: 'Leads', path: '/crm/leads' });
          crumbs.push({ label: 'Create Lead', path: pathname });
        } else if (pathname.includes('/ai-research')) {
          const leadId = pathname.split('/')[3];
          crumbs.push({ label: 'Leads', path: '/crm/leads' });
          crumbs.push({ label: `Lead ${leadId?.slice(0, 8)}...`, path: `/crm/leads/${leadId}` });
          crumbs.push({ label: 'AI Research', path: pathname });
        } else if (pathname.includes('/edit')) {
          const leadId = pathname.split('/')[3];
          crumbs.push({ label: 'Leads', path: '/crm/leads' });
          crumbs.push({ label: `Lead ${leadId?.slice(0, 8)}...`, path: `/crm/leads/${leadId}` });
          crumbs.push({ label: 'Edit', path: pathname });
        } else {
          const leadId = pathname.split('/').pop();
          crumbs.push({ label: 'Leads', path: '/crm/leads' });
          crumbs.push({ label: `Lead ${leadId?.slice(0, 8)}...`, path: pathname });
        }
      } else if (pathname.startsWith('/crm/activities') || pathname.startsWith('/crm/activity')) {
        if (pathname === '/crm/activities') {
          crumbs.push({ label: 'Activities', path: '/crm/activities' });
        } else if (pathname.includes('/new')) {
          crumbs.push({ label: 'Activities', path: '/crm/activities' });
          crumbs.push({ label: 'Create Activity', path: pathname });
        } else if (pathname.includes('/pipeline/')) {
          const activityId = pathname.split('/').pop();
          crumbs.push({ label: 'Activities', path: '/crm/activities' });
          crumbs.push({ label: 'Pipeline', path: `/crm/activities/pipeline/${activityId}` });
        } else {
          const activityId = pathname.split('/').pop();
          crumbs.push({ label: 'Activities', path: '/crm/activities' });
          crumbs.push({ label: `Activity ${activityId?.slice(0, 8)}...`, path: pathname });
        }
      } else if (pathname.startsWith('/crm/followups')) {
        crumbs.push({ label: 'Activities', path: '/crm/activities' });
        crumbs.push({ label: 'Follow-ups', path: '/crm/followups' });
      }
    }

    return crumbs;
  }, [location.pathname]);

  return {
    getBackPath,
    navigateWithContext,
    goBack,
    breadcrumbs,
    navigationState
  };
};