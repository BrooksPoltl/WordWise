import React from 'react';

const DocumentIcon = () => (
  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const benefits = [
  {
    id: 'benefit-1',
    title: 'Write PRDs Engineers Love',
    description: 'Eliminate ambiguity with suggestions for clarity, completeness, and technical accuracy that help you ship faster.',
    icon: <DocumentIcon />,
  },
  {
    id: 'benefit-2',
    title: 'Make Technical Docs Readable',
    description: 'Simplify complex concepts and improve readability without losing technical precision, making your docs accessible to all.',
    icon: <CodeIcon />,
  },
  {
    id: 'benefit-3',
    title: 'Strengthen Stakeholder Buy-in',
    description: 'Build stronger arguments with data-driven suggestions and present clearer roadmaps that get executive approval.',
    icon: <UsersIcon />,
  }
];

const TestimonialsSection: React.FC = () => (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Unlock New Levels of Clarity and Speed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AlignWrite helps you translate complex ideas into clear, compelling documents that drive results.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="bg-white rounded-xl shadow-lg p-8 border text-center hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center items-center mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

export default TestimonialsSection; 