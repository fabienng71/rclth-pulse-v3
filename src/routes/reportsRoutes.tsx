
import React from 'react';
import { Route } from 'react-router-dom';
import Reports from '../pages/Reports';
import CreditMemoReport from '../pages/reports/CreditMemoReport';
import ItemReport from '../pages/reports/ItemReport';
import ItemDetailsPage from '../pages/reports/ItemDetailsPage';
import CustomerReport from '../pages/reports/CustomerReport';
import CustomerReportEnhanced from '../pages/reports/CustomerReportEnhanced';
import CogsReport from '../pages/reports/CogsReport';
import CogsHistoryPage from '../pages/reports/CogsHistoryPage';
import VendorReport from '../pages/reports/VendorReport';
import ChannelReport from '../pages/reports/ChannelReport';
import CategoryReport from '../pages/reports/CategoryReport';
import CategoryItemsDetails from '../pages/reports/CategoryItemsDetails';
import BudgetReport from '../pages/reports/BudgetReport';
import BudgetFormPage from '../pages/reports/BudgetFormPage';
import CustomerDetailsPage from '../pages/reports/CustomerDetailsPage';
import CustomerTurnoverPage from '../pages/reports/CustomerTurnoverPage';
import ChannelCustomersReport from '../pages/reports/ChannelCustomersReport';
import NewCustomersReport from '../pages/reports/NewCustomersReport';
import NewCustomersMonthDetail from '../pages/reports/NewCustomersMonthDetail';
import AdministrationReport from '../pages/reports/AdministrationReport';
import MarginAnalysis from '../pages/reports/MarginAnalysis';
import MTDReport from '../pages/reports/MTDReport';
import WeeklyReport from '../pages/reports/WeeklyReport';
import TopNReport from '../pages/reports/TopNReport';
import ExecutiveReport from '../pages/reports/ExecutiveReport';
import SalespersonAnalysisReport from '../pages/reports/SalespersonAnalysisReport';
import SalesAnalysis from '../pages/reports/SalesAnalysis';
import ChannelIntelligenceReport from '../pages/reports/ChannelIntelligenceReport';
import MonthlyReport from '../pages/reports/MonthlyReport';
import RegionReport from '../pages/reports/RegionReport';
import ProtectedRoute from '../components/ProtectedRoute';

const ReportsRoutes = (
  <>
    <Route path="/reports" element={
      <ProtectedRoute>
        <Reports />
      </ProtectedRoute>
    } />
    
    {/* Executive Dashboard - Admin only */}
    <Route path="/reports/executive" element={
      <ProtectedRoute requireAdmin>
        <ExecutiveReport />
      </ProtectedRoute>
    } />
    
    {/* Channel Intelligence Report - Admin only */}
    <Route path="/reports/channel-intelligence" element={
      <ProtectedRoute requireAdmin>
        <ChannelIntelligenceReport />
      </ProtectedRoute>
    } />
    
    <Route path="/reports/weekly" element={
      <ProtectedRoute>
        <WeeklyReport />
      </ProtectedRoute>
    } />
    <Route path="/reports/mtd" element={
      <ProtectedRoute>
        <MTDReport />
      </ProtectedRoute>
    } />
    <Route path="/reports/monthly" element={
      <ProtectedRoute>
        <MonthlyReport />
      </ProtectedRoute>
    } />
    <Route path="/reports/top-n" element={
      <ProtectedRoute>
        <TopNReport />
      </ProtectedRoute>
    } />
    
    <Route path="/reports/region" element={
      <ProtectedRoute>
        <RegionReport />
      </ProtectedRoute>
    } />

    {/* Salesperson Analysis Report - Admin only */}
    <Route path="/reports/salesperson-analysis" element={
      <ProtectedRoute requireAdmin>
        <SalespersonAnalysisReport />
      </ProtectedRoute>
    } />

    {/* Sales Analysis & Churn Detection - Available to all authenticated users */}
    <Route path="/reports/sales-analysis" element={
      <ProtectedRoute>
        <SalesAnalysis />
      </ProtectedRoute>
    } />

    <Route path="/reports/credit-memos" element={
      <ProtectedRoute>
        <CreditMemoReport />
      </ProtectedRoute>
    } />
    <Route path="/reports/items" element={
      <ProtectedRoute>
        <ItemReport />
      </ProtectedRoute>
    } />
    <Route path="/reports/items/details" element={
      <ProtectedRoute>
        <ItemDetailsPage />
      </ProtectedRoute>
    } />
    <Route path="/reports/customers" element={
      <ProtectedRoute>
        <CustomerReportEnhanced />
      </ProtectedRoute>
    } />
    <Route path="/reports/customers/details" element={
      <ProtectedRoute>
        <CustomerDetailsPage />
      </ProtectedRoute>
    } />
    <Route path="/reports/customers/turnover" element={
      <ProtectedRoute>
        <CustomerTurnoverPage />
      </ProtectedRoute>
    } />
    <Route path="/reports/cogs" element={
      <ProtectedRoute>
        <CogsReport />
      </ProtectedRoute>
    } />
    <Route path="/reports/cogs/history" element={
      <ProtectedRoute>
        <CogsHistoryPage />
      </ProtectedRoute>
    } />
    <Route path="/reports/vendors" element={
      <ProtectedRoute>
        <VendorReport />
      </ProtectedRoute>
    } />
    <Route path="/reports/channels" element={
      <ProtectedRoute>
        <ChannelReport />
      </ProtectedRoute>
    } />
    <Route path="/reports/channels/:channel" element={
      <ProtectedRoute>
        <ChannelCustomersReport />
      </ProtectedRoute>
    } />
    <Route path="/reports/categories" element={
      <ProtectedRoute>
        <CategoryReport />
      </ProtectedRoute>
    } />
    <Route path="/reports/categories/details" element={
      <ProtectedRoute>
        <CategoryItemsDetails />
      </ProtectedRoute>
    } />
    <Route path="/reports/budget" element={
      <ProtectedRoute>
        <BudgetReport />
      </ProtectedRoute>
    } />
    
    {/* Administration Report */}
    <Route path="/reports/administration" element={
      <ProtectedRoute requireAdmin>
        <AdministrationReport />
      </ProtectedRoute>
    } />
    
    {/* New Customers Report */}
    <Route path="/reports/new-customers" element={
      <ProtectedRoute requireAdmin>
        <NewCustomersReport />
      </ProtectedRoute>
    } />
    
    {/* New Customers Monthly Detail */}
    <Route path="/reports/new-customers/:month" element={
      <ProtectedRoute requireAdmin>
        <NewCustomersMonthDetail />
      </ProtectedRoute>
    } />
    
    {/* Margin Analysis Report */}
    <Route path="/reports/margin-analysis" element={
      <ProtectedRoute requireAdmin>
        <MarginAnalysis />
      </ProtectedRoute>
    } />
    
    {/* Fix the routes ordering: specific routes first, then parameter routes */}
    <Route path="/reports/budget/new" element={
      <ProtectedRoute>
        <BudgetFormPage />
      </ProtectedRoute>
    } />
    
    {/* Add an explicit edit route to match the one used in the BudgetTable component */}
    <Route path="/reports/budget/edit/:id" element={
      <ProtectedRoute>
        <BudgetFormPage />
      </ProtectedRoute>
    } />
    
    <Route path="/reports/budget/:id" element={
      <ProtectedRoute>
        <BudgetFormPage />
      </ProtectedRoute>
    } />
  </>
);

export default ReportsRoutes;
