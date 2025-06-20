import React, { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper';
import Dashboard from './components/Dashboard';
import DocumentEditor from './components/DocumentEditor';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Profile from './components/Profile';
import { useAuthStore } from './store/auth/auth.store';

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

  // Helper function to determine if user needs onboarding
  // More explicit check: if user exists but onboardingCompleted is false or undefined
  const needsOnboarding = user && (user.onboardingCompleted !== true);

  // Helper function to get redirect path for authenticated users
  const getAuthenticatedRedirect = () => {
    if (needsOnboarding) return '/onboarding';
    return '/dashboard';
  };

  // Helper function to render protected route element
  const renderProtectedRoute = (component: React.ReactElement) => {
    if (!user) return <Navigate to="/" replace />;
    if (needsOnboarding) return <Navigate to="/onboarding" replace />;
    return component;
  };

  // Helper function to render auth route element
  const renderAuthRoute = () => {
    if (!user) {
      return (
        <AuthWrapper
          onAuthSuccess={() => {
            // Authentication success is handled by the auth store
            // This callback could be used for additional logic if needed
          }}
        />
      );
    }
    return <Navigate to={getAuthenticatedRedirect()} replace />;
  };

  // Helper function to render onboarding route element
  const renderOnboardingRoute = () => {
    if (!user) return <Navigate to="/" replace />;
    if (!needsOnboarding) return <Navigate to="/dashboard" replace />;
    return <Onboarding />;
  };

  return (
    <Router>
      <Routes>
        {/* Landing page for unauthenticated users */}
        <Route 
          path="/" 
          element={
            user ? <Navigate to={getAuthenticatedRedirect()} replace /> : <LandingPage />
          } 
        />

        {/* Auth routes */}
        <Route path="/auth" element={renderAuthRoute()} />

        {/* Onboarding route */}
        <Route path="/onboarding" element={renderOnboardingRoute()} />

        {/* Protected routes */}
        <Route path="/dashboard" element={renderProtectedRoute(<Dashboard />)} />

        <Route path="/profile" element={renderProtectedRoute(<Profile />)} />

        <Route
          path="/editor/:documentId"
          element={renderProtectedRoute(<DocumentEditor />)}
        />

        {/* Catch all route */}
        <Route
          path="*"
          element={
            <Navigate 
              to={user ? getAuthenticatedRedirect() : '/'} 
              replace 
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
