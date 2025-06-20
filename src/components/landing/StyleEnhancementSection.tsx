import React from 'react';

const StyleEnhancementSection: React.FC = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Real-time Writing Enhancement
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          See instant suggestions as you type. No more switching between tools or 
          interrupting your flow—get intelligent feedback right where you write.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Editor Mockup */}
        <div className="order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-2xl border overflow-hidden">
            {/* Editor Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Product Requirements Document</h3>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    5 suggestions
                  </span>
                  <button type="button" className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Editor Content */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  This feature{' '}
                  <span className="relative">
                    <span className="underline decoration-red-500 decoration-wavy">recieve</span>
                    <div className="absolute top-6 left-0 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg z-10 w-64">
                      <div className="text-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span className="font-medium text-red-900">Spelling</span>
                        </div>
                        <p className="text-red-800 mb-2">Did you mean <strong>receive</strong>?</p>
                        <div className="flex space-x-2">
                          <button type="button" className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">
                            Fix
                          </button>
                          <button type="button" className="text-red-600 px-2 py-1 rounded text-xs hover:bg-red-50">
                            Ignore
                          </button>
                        </div>
                      </div>
                    </div>
                  </span>
                  {' '}positive feedback from users and{' '}
                  <span className="underline decoration-blue-500 decoration-wavy">
                    significantly impacts user engagement metrics
                  </span>
                  . The implementation{' '}
                  <span className="underline decoration-purple-500 decoration-wavy">
                    requires extensive development work and testing procedures to be conducted
                  </span>
                  {' '}before launch.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  <span className="underline decoration-green-500 decoration-wavy">
                    In order to ensure that the feature works as expected
                  </span>
                  , we need to{' '}
                  <span className="underline decoration-yellow-500 decoration-wavy">
                    be focused on
                  </span>
                  {' '}comprehensive testing across all supported platforms.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Explanations */}
        <div className="order-1 lg:order-2">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Five Types of Intelligence
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                WordWise analyzes your writing across multiple dimensions, providing 
                targeted suggestions that make your documents clearer and more impactful.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Spell Check</h4>
                  <p className="text-gray-600 text-sm">
                    Advanced spell checking that understands context and technical terminology.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Clarity Enhancement</h4>
                  <p className="text-gray-600 text-sm">
                    Identifies complex sentences and suggests clearer alternatives.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Readability</h4>
                  <p className="text-gray-600 text-sm">
                    Analyzes sentence structure and suggests improvements for better flow.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Conciseness</h4>
                  <p className="text-gray-600 text-sm">
                    Spots wordy phrases and recommends more concise alternatives.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Passive Voice</h4>
                  <p className="text-gray-600 text-sm">
                    Detects passive voice and suggests active alternatives for stronger writing.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
              <h4 className="font-semibold mb-2">⚡ Real-time Analysis</h4>
              <p className="text-blue-100 text-sm">
                All suggestions appear instantly as you type, with no lag or interruption to your writing flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default StyleEnhancementSection; 