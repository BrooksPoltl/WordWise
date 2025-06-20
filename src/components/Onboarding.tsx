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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 md:p-8">
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
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
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
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={!selectedRole || isSubmitting || loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors text-sm md:text-base"
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
                className="sm:w-auto bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
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