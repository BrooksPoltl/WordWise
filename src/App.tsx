import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AuthWrapper from './components/AuthWrapper';
import Dashboard from './components/Dashboard';
import DocumentEditor from './components/DocumentEditor';

const App: React.FC = () => {
  const { user, isInitialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize authentication state listener
    initializeAuth();
  }, [initializeAuth]);

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading WordWise...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/auth"
          element={
            !user ? (
              <AuthWrapper
                onAuthSuccess={() => {
                  // Authentication success is handled by the auth store
                  // This callback could be used for additional logic if needed
                }}
              />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/auth" replace />}
        />

        <Route
          path="/editor/:documentId"
          element={user ? <DocumentEditor /> : <Navigate to="/auth" replace />}
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={<Navigate to={user ? '/dashboard' : '/auth'} replace />}
        />

        {/* Catch all route */}
        <Route
          path="*"
          element={<Navigate to={user ? '/dashboard' : '/auth'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
