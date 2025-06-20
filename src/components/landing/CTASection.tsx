import React from 'react';
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => (
  <section id="cta" className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
        Ready to Write with Confidence?
      </h2>
      
      <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
        Join thousands of Product Managers and Software Engineers who use WordWise 
        to create clearer, more impactful documentation.
      </p>

      {/* Feature Highlights */}
      <div className="flex flex-wrap justify-center gap-6 mb-10">
        <div className="flex items-center space-x-2 text-blue-100">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Free to start</span>
        </div>
        <div className="flex items-center space-x-2 text-blue-100">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>No credit card required</span>
        </div>
        <div className="flex items-center space-x-2 text-blue-100">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Setup in 2 minutes</span>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="space-y-4">
        <Link
          to="/auth"
          className="inline-block bg-white text-blue-600 hover:text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Start Writing Better Today
        </Link>
        
        <p className="text-blue-200 text-sm">
          Join 10,000+ professionals already using WordWise
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 pt-8 border-t border-blue-500 border-opacity-30">
        <div className="grid md:grid-cols-3 gap-8 text-blue-100">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm">Enterprise Security</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm">Lightning Fast</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-sm">24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection; 