import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import AuthWrapper from './components/AuthWrapper';
import Dashboard from './components/Dashboard';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading WordWise...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (user) {
    return <Dashboard />;
  }

  // If user is not authenticated, show auth wrapper
  return (
    <AuthWrapper 
      onAuthSuccess={() => {
        // Authentication success is handled by the auth store
        // This callback could be used for additional logic if needed
      }} 
    />
  );
};

export default App; 