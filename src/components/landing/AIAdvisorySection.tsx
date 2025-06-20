import React from 'react';

const AIAdvisorySection: React.FC = () => (
  <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Strategic AI Advisory
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get high-level feedback on your document&apos;s structure, argumentation, and impact. 
          Perfect for PRDs, technical specs, and strategic documents.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Advisory Modal Mockup */}
        <div className="order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-2xl border overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">AI Advisory Comments</h3>
                <div className="flex items-center space-x-2">
                  <span className="bg-white bg-opacity-20 text-white px-2 py-1 rounded text-sm">
                    5 suggestions
                  </span>
                  <button type="button" className="text-white hover:text-gray-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Advisory Comments */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-900 mb-1">Strengthen Your Claim</h4>
                    <p className="text-sm text-orange-800 mb-2">
                      <span className="font-medium">&ldquo;This will improve user engagement&rdquo;</span>
                    </p>
                    <p className="text-sm text-orange-700">
                      Consider adding a specific data point or example to support this claim. 
                      What metrics will you track to measure engagement?
                    </p>
                    <button type="button" className="mt-2 text-orange-600 text-sm hover:text-orange-800 font-medium">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-1">Define Key Term</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      <span className="font-medium">&ldquo;API Gateway&rdquo;</span>
                    </p>
                    <p className="text-sm text-blue-700">
                      This technical term may be unfamiliar to some stakeholders. 
                      Consider adding a brief definition for clarity.
                    </p>
                    <button type="button" className="mt-2 text-blue-600 text-sm hover:text-blue-800 font-medium">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-purple-900 mb-1">Improve Structure</h4>
                    <p className="text-sm text-purple-800 mb-2">
                      <span className="font-medium">&ldquo;Implementation section&rdquo;</span>
                    </p>
                    <p className="text-sm text-purple-700">
                      This paragraph covers multiple topics. Consider breaking it into 
                      smaller, focused sections for better readability.
                    </p>
                    <button type="button" className="mt-2 text-purple-600 text-sm hover:text-purple-800 font-medium">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Description */}
        <div className="order-1 lg:order-2">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Beyond Grammar: Strategic Feedback
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                While other tools focus on grammar and spelling, WordWise provides high-level 
                strategic feedback to strengthen your arguments and improve document impact.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Strengthen Claims</h4>
                  <p className="text-gray-600 text-sm">
                    Identify unsupported statements and get suggestions for adding data, examples, or evidence.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Define Key Terms</h4>
                  <p className="text-gray-600 text-sm">
                    Spot jargon and acronyms that need clarification for your audience.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Improve Structure</h4>
                  <p className="text-gray-600 text-sm">
                    Get recommendations for better organization and flow of your content.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Add Call to Action</h4>
                  <p className="text-gray-600 text-sm">
                    Ensure your documents guide readers toward clear next steps and decisions.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
              <h4 className="font-semibold mb-2">Perfect for:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• Product Requirements</div>
                <div>• Technical Specifications</div>
                <div>• Strategy Documents</div>
                <div>• Project Proposals</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AIAdvisorySection; 