import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ViewProfile from './pages/ViewProfile';
import UnitsPage from './pages/UnitsPage';
import UnitDetailPage from './pages/UnitDetailPage';
import DarkModeToggle from './components/DarkModeToggle';

import SignInOptionPage from './pages/SignInOptionPage'; // new page to choose sign-in or sign-up
import SignUpPage from './pages/SignUpPage';             // sign-up page
import PendingListPage from './pages/PendingListPage';
import EmployeeLogsPage from './pages/EmployeeLogsPage';
import BillingPage from './pages/BillingPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <DarkModeToggle />
        <Routes>
          {/* Redirect root to the signin option page */}
          <Route path="/" element={<Navigate to="/signin" replace />} />

          {/* The new Sign In / Sign Up selection page */}
          <Route path="/signin" element={<SignInOptionPage />} />

          {/* Sign Up page */}
          <Route path="/signup" element={<SignUpPage />} />

          {/* Login page */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-profile"
            element={
              <ProtectedRoute>
                <ViewProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/units"
            element={
              <ProtectedRoute>
                <UnitsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/units/:unitName"
            element={
              <ProtectedRoute>
                <UnitDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending-list/:unitName"
            element={
              <ProtectedRoute>
                <PendingListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-logs"
            element={
              <ProtectedRoute>
                <EmployeeLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <BillingPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 route */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
