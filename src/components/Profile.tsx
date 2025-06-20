import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { USER_ROLES, UserRole } from '../constants/userConstants';
import { useAuthStore } from '../store/auth/auth.store';
import { useUserStore } from '../store/user/user.store';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { updateProfile, loading, error } = useUserStore();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(user?.role as UserRole || null);
  const [persona, setPersona] = useState(user?.persona || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated or onboarding not completed
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
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
      
      // Redirect back to the previous page after successful save
      navigate(-1);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const hasChanges = selectedRole !== user.role || persona !== (user.persona || '');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Update your role and persona to get more personalized suggestions.
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Current User Info */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Account Information
              </h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                {user.displayName && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Name:</span> {user.displayName}
                  </p>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Role <span className="text-red-500">*</span>
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
                Your Professional Context
              </h2>
              <p className="text-gray-600 text-sm md:text-base mb-4">
                Describe your work environment, industry, or specific focus areas to get more relevant suggestions.
              </p>
              <textarea
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="e.g., I work at a fintech startup focused on mobile payment solutions for small businesses..."
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
                disabled={!selectedRole || !hasChanges || isSubmitting || loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                {isSubmitting || loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving changes...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || loading}
                className="sm:w-auto bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 