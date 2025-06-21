import React, { Suspense, lazy } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper';
import Onboarding from './components/Onboarding';
import { useAuthStore } from './store/auth/auth.store';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const DocumentEditor = lazy(() => import('./components/DocumentEditor'));
const DocumentList = lazy(() => import('./components/DocumentList'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const Profile = lazy(() => import('./components/Profile'));
const EditorV2 = lazy(() => import('./components/EditorV2'));

const App: React.FC = () => {
  const { user, isInitialized, initializeAuth } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            Loading...
          </div>
        }
      >
        <Routes>
          {(() => {
            if (!user) {
              return (
                <>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthWrapper onAuthSuccess={() => {}} />} />
                  <Route path="/*" element={<Navigate to="/auth" />} />
                </>
              );
            }
            if (!user.onboardingCompleted) {
              return (
                <>
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/*" element={<Navigate to="/onboarding" />} />
                </>
              );
            }
            return (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/documents" element={<DocumentList />} />
                <Route path="/document/:id" element={<DocumentEditor />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/editor-v2" element={<EditorV2 />} />
                <Route path="/*" element={<Navigate to="/dashboard" />} />
              </>
            );
          })()}
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
