
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Marketing from '../pages/Marketing';
import Documents from '../pages/marketing/Documents';
import FolderDocuments from '../pages/marketing/FolderDocuments';
import PriceList from '../pages/marketing/PriceList';

const MarketingRoutes = (
  <>
    <Route path="/marketing" element={<Marketing />} />
    <Route path="/marketing/documents" element={<Documents />} />
    <Route path="/marketing/documents/:folderName" element={<FolderDocuments />} />
    <Route path="/marketing/price-list" element={<PriceList />} />
  </>
);

export default MarketingRoutes;
