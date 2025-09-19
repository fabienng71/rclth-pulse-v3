
import React from 'react';
import MainCrmRoutes from './crm/mainRoutes';
import ActivityRoutes from './crm/activityRoutes';
import ContactRoutes from './crm/contactRoutes';
import LeadRoutes from './crm/leadRoutes';
import ProjectRoutes from './crm/projectRoutes';
import UtilityRoutes from './crm/utilityRoutes';
import LeadCenterRoutes from './crm/leadCenterRoutes';

const CrmRoutes = (
  <>
    {MainCrmRoutes}
    {ActivityRoutes}
    {ContactRoutes}
    {LeadRoutes}
    {LeadCenterRoutes}
    {ProjectRoutes}
    {UtilityRoutes}
  </>
);

export default CrmRoutes;
