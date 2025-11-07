// App.js - Updated with Multi-User Fulfillment Routes - PRESERVES ALL EXISTING FUNCTIONALITY
// Location: /frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

// EXISTING IMPORTS - DO NOT REMOVE
import Dashboard from './components/Dashboard';
import CsvUpload from './components/CsvUpload';
import ProductMapping from './components/ProductMapping';
import ImportPreview from './components/ImportPreview';
import ImportReport from './components/ImportReport';
import Export from './components/Export';
import CustomerMergePage from './components/CustomerMergePage';
import BackerPreview from './components/BackerPreview';

// NEW FULFILLMENT IMPORTS
import FulfillmentDashboard from './components/FulfillmentDashboard';
import AdminDashboard from './components/AdminDashboard';
import EmployeeStation from './components/EmployeeStation';
import PullList from './components/PullList';
import OrderScanningPage from './components/OrderScanningPage';

// MARK AS PAID IMPORT
import MarkAsPaid from './components/MarkAsPaid';

// WHOLESALE IMPORTS
import WholesalePricingRules from './components/WholesalePricingRules';
import WholesaleShipping from './components/WholesaleShipping';
import WholesaleOrderLimits from './components/WholesaleOrderLimits';
import WholesaleSettings from './components/WholesaleSettings';

// BOX SELECTOR IMPORTS
import BoxLibrary from './components/BoxLibrary';
import ProductDimensions from './components/ProductDimensions';
import BoxAssignments from './components/BoxAssignments';
import BoxSettings from './components/BoxSettings';

function App() {
  return (
    <AppProvider 
      i18n={{
        Polaris: {
          Avatar: {
            label: 'Avatar',
            labelWithInitials: 'Avatar with initials {initials}',
          },
          ContextualSaveBar: {
            save: 'Save',
            discard: 'Discard',
          },
          TextField: {
            characterCount: '{count} characters',
          },
          TopBar: {
            toggleMenuLabel: 'Toggle menu',
            SearchField: {
              clearButtonLabel: 'Clear',
              search: 'Search',
            },
          },
          Modal: {
            iFrameTitle: 'body markup',
          },
          Frame: {
            skipToContent: 'Skip to content',
            navigationLabel: 'Navigation',
            Navigation: {
              closeMobileNavigationLabel: 'Close navigation',
            },
          },
        },
      }}
    >
      <Router>
        <Routes>
          {/* EXISTING ROUTES - DO NOT MODIFY */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customer-merge" element={<CustomerMergePage />} />
          <Route path="/project/:projectId/upload" element={<CsvUpload />} />
          <Route path="/project/:projectId/mapping" element={<ProductMapping />} />
          <Route path="/project/:projectId/preview" element={<ImportPreview />} />
          <Route path="/project/:projectId/backers" element={<BackerPreview />} />
          <Route path="/project/:projectId/export" element={<Export />} />
          <Route path="/project/:projectId/report" element={<ImportReport />} />

          {/* MARK AS PAID ROUTE */}
          <Route path="/mark-as-paid" element={<MarkAsPaid />} />

          {/* NEW FULFILLMENT ROUTES - ADDED WITHOUT AFFECTING EXISTING */}
          <Route path="/fulfillment" element={<FulfillmentDashboard />} />
          <Route path="/fulfillment/admin" element={<AdminDashboard />} />
          <Route path="/employee/:userId" element={<EmployeeStation />} />
          <Route path="/employee/:userId/pull-list/:assignmentId" element={<PullList />} />
          <Route path="/employee/:userId/scan/:assignmentId" element={<OrderScanningPage />} />

          {/* WHOLESALE PRICING ROUTES */}
          <Route path="/wholesale/pricing-rules" element={<WholesalePricingRules />} />
          <Route path="/wholesale/shipping" element={<WholesaleShipping />} />
          <Route path="/wholesale/order-limits" element={<WholesaleOrderLimits />} />
          <Route path="/wholesale/settings" element={<WholesaleSettings />} />

          {/* BOX SELECTOR ROUTES */}
          <Route path="/box-selector/boxes" element={<BoxLibrary />} />
          <Route path="/box-selector/dimensions" element={<ProductDimensions />} />
          <Route path="/box-selector/assignments" element={<BoxAssignments />} />
          <Route path="/box-selector/settings" element={<BoxSettings />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;