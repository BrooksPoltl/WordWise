import React from 'react';
import { useAuthStore } from '../../store/auth/auth.store';
import AIAssistantCard from './AIAssistantCard';
import SmartAnalysisCard from './SmartAnalysisCard';

const FeatureShowcaseSection: React.FC = () => {
  const { user } = useAuthStore();
  const getPersonalizedSubtitle = () => {
    if (user?.role) {
      const formattedRole = `${user.role}s`;
      return `Transform your writing with comprehensive AI analysis and smart recommendations for ${formattedRole}`;
    }
    return 'Transform your writing with comprehensive AI analysis and smart recommendations';
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Discover AlignWrite Features</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {getPersonalizedSubtitle()}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SmartAnalysisCard />
          <AIAssistantCard />
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcaseSection; 