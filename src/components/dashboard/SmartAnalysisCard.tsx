import React from 'react';

const SmartAnalysisCard: React.FC = () => {
  const features = [
    {
      id: 'spell-checking',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      name: 'Spell Checking',
      description: 'Real-time error detection'
    },
    {
      id: 'readability',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      name: 'Readability',
      description: 'Improve text clarity'
    },
    {
      id: 'clarity-suggestions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      name: 'Clarity Suggestions',
      description: 'Make messages clearer'
    },
    {
      id: 'conciseness',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      name: 'Conciseness',
      description: 'Remove unnecessary words'
    },
    {
      id: 'passive-voice',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m4 0H4l1 16h14L20 4z" />
        </svg>
      ),
      name: 'Passive Voice Detection',
      description: 'Strengthen your writing'
    }
  ];

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white transition-all duration-300 hover:shadow-lg">
      <div className="relative z-10">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Smart Writing Analysis</h3>
            <p className="text-sm opacity-90">Real-time writing improvements as you type</p>
          </div>
        </div>

        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center text-sm">
              <span className="text-white/80 mr-2">{feature.icon}</span>
              <span className="font-medium mr-2">{feature.name}</span>
              <span className="text-white/80">- {feature.description}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white rounded-full" />
        <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white rounded-full" />
      </div>
    </div>
  );
};

export default SmartAnalysisCard; 