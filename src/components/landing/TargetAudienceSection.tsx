import React from 'react';

const TargetAudienceSection: React.FC = () => (
  <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Built for Technical Teams
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Whether you&apos;re writing PRDs, technical specs, or documentation, AlignWrite understands 
          the unique challenges of technical communication.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Managers */}
        <div className="bg-white rounded-xl shadow-lg p-8 border">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Product Managers</h3>
              <p className="text-gray-600">Drive alignment with clear, compelling documents</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">PRD Excellence</h4>
                <p className="text-gray-600 text-sm">
                  Write product requirements that engineers love. Get suggestions for clarity, 
                  completeness, and technical accuracy.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Stakeholder Buy-in</h4>
                <p className="text-gray-600 text-sm">
                  Strengthen your arguments with data-driven suggestions. Make compelling cases 
                  for features and initiatives.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Strategic Communication</h4>
                <p className="text-gray-600 text-sm">
                  Get high-level feedback on document structure, flow, and impact. 
                  Perfect for roadmaps and strategy docs.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-blue-900">Perfect for:</span>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• Product Requirements Documents</div>
              <div>• Feature Specifications</div>
              <div>• Roadmap Communications</div>
              <div>• Stakeholder Updates</div>
            </div>
          </div>
        </div>

        {/* Software Engineers */}
        <div className="bg-white rounded-xl shadow-lg p-8 border">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Software Engineers</h3>
              <p className="text-gray-600">Write technical docs that actually get read</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Technical Documentation</h4>
                <p className="text-gray-600 text-sm">
                  Make complex technical concepts accessible. Get suggestions for clarity 
                  without losing technical accuracy.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Code Review Comments</h4>
                <p className="text-gray-600 text-sm">
                  Write constructive, clear feedback. Improve team communication 
                  and reduce back-and-forth in reviews.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Architecture Proposals</h4>
                <p className="text-gray-600 text-sm">
                  Present technical decisions clearly. Get feedback on structure, 
                  argumentation, and stakeholder communication.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-purple-900">Perfect for:</span>
            </div>
            <div className="text-sm text-purple-800 space-y-1">
              <div>• Technical Design Documents</div>
              <div>• API Documentation</div>
              <div>• Architecture Proposals</div>
              <div>• Code Review Comments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default TargetAudienceSection; 