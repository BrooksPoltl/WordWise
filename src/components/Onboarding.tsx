import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ONBOARDING_TEXT, USER_ROLES, UserRole } from '../constants/userConstants';
import { useAuthStore } from '../store/auth/auth.store';
import { useUserStore } from '../store/user/user.store';

const Onboarding: React.FC = () => {
  const { user } = useAuthStore();
  const { updateProfile, loading, error } = useUserStore();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [persona, setPersona] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await updateProfile({
        role: selectedRole,
        persona: persona.trim() || undefined,
      });
      
      // Navigate to dashboard after successful onboarding
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipPersona = async () => {
    if (!selectedRole) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await updateProfile({
        role: selectedRole,
      });
      
      // Navigate to dashboard after successful onboarding
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0" />
      <div className="absolute top-40 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 z-0" />
      <div className="absolute bottom-20 right-1/3 w-60 h-60 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-4000 z-0" />
      
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 border border-white/60 z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {ONBOARDING_TEXT.TITLE}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {ONBOARDING_TEXT.ROLE_SUBTITLE}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Role Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              What&apos;s your role? <span className="text-red-500">*</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
              {USER_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md min-h-[4rem] flex items-center ${
                    selectedRole === role
                      ? 'border-blue-500 bg-blue-50/90 text-blue-900 backdrop-blur-sm shadow-sm'
                      : 'border-gray-200 bg-white/90 text-gray-700 hover:border-gray-300 backdrop-blur-sm'
                  }`}
                >
                  <div className="font-medium text-sm md:text-base">{role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Persona Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {ONBOARDING_TEXT.PERSONA_TITLE}
            </h2>
            <p className="text-gray-600 text-sm md:text-base mb-4">
              {ONBOARDING_TEXT.PERSONA_DESCRIPTION}
            </p>
            <textarea
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="e.g., I'm a product manager at a fintech startup focused on mobile payment solutions for small businesses..."
              className="w-full h-32 p-4 border border-gray-300/60 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base bg-white/90 backdrop-blur-sm shadow-sm"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {persona.length}/1000 characters
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50/90 backdrop-blur-sm border border-red-200/60 rounded-lg p-4 shadow-sm">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={!selectedRole || isSubmitting || loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm md:text-base shadow-md"
            >
              {isSubmitting || loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Setting up your profile...
                </div>
              ) : (
                'Complete Setup'
              )}
            </button>
            
            {selectedRole && (
              <button
                type="button"
                onClick={handleSkipPersona}
                disabled={isSubmitting || loading}
                className="sm:w-auto bg-white/90 backdrop-blur-sm text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base border border-gray-300/60 shadow-sm"
              >
                Skip for now
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding; 