import React, { useState } from 'react';

const AIRewritesSection: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0);

  const examples = [
    {
      id: 'passive-voice',
      category: 'Passive Voice → Active Voice',
      before: 'The bug was fixed by the engineering team after extensive testing was conducted.',
      after: 'The engineering team fixed the bug after conducting extensive testing.',
      improvement: 'More direct and engaging'
    },
    {
      id: 'complex-simple',
      category: 'Complex → Simple',
      before: 'The implementation of this feature necessitates the utilization of advanced algorithms in order to facilitate optimal performance.',
      after: 'This feature needs advanced algorithms to perform optimally.',
      improvement: '60% fewer words, clearer meaning'
    },
    {
      id: 'wordy-concise',
      category: 'Wordy → Concise',
      before: 'Due to the fact that the current system is not capable of handling the increased load, we need to make improvements.',
      after: 'Since the current system cannot handle the increased load, we need improvements.',
      improvement: 'Eliminated redundant phrases'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Rewrites
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Go beyond simple corrections. Get intelligent rewrites that transform your writing 
            from good to exceptional using GPT-4.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Example Tabs */}
          <div className="flex flex-wrap justify-center mb-8 space-x-2">
            {examples.map((example, index) => (
              <button
                key={example.id}
                type="button"
                onClick={() => setActiveExample(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors mb-2 ${
                  activeExample === index
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {example.category}
              </button>
            ))}
          </div>

          {/* Before/After Comparison */}
          <div className="bg-gray-50 rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <h3 className="font-semibold text-gray-900">Before</h3>
                </div>
                <div className="bg-white rounded-lg p-6 border-2 border-red-200">
                  <p className="text-gray-700 leading-relaxed">
                    {examples[activeExample].before}
                  </p>
                </div>
              </div>

              {/* After */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <h3 className="font-semibold text-gray-900">After</h3>
                </div>
                <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                  <p className="text-gray-700 leading-relaxed">
                    {examples[activeExample].after}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-green-600 font-medium">
                      ✓ {examples[activeExample].improvement}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Badge */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Powered by GPT-4</span>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
              <p className="text-gray-600 text-sm">
                Get AI rewrites in seconds, not minutes. No waiting, no interruption to your flow.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Context-Aware</h3>
              <p className="text-gray-600 text-sm">
                AI understands your document context to provide relevant, accurate suggestions.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Always Learning</h3>
              <p className="text-gray-600 text-sm">
                Powered by the latest AI models, continuously improving with each update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIRewritesSection; 