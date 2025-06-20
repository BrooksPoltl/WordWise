import React, { useState } from 'react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold text-gray-900">WordWise</span>
          </div>

          {/* Desktop Navigation */}
          {/* <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How it Works
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
              Testimonials
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
          </div> */}

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              Sign up for free
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#how-it-works" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                How it Works
              </a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Testimonials
              </a>
              <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Pricing
              </a> */}
              <div className="pt-4 pb-2 border-t border-gray-100">
                <button
                  type="button"
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="block w-full text-left px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg mt-2 hover:from-blue-600 hover:to-purple-600"
                >
                  Sign up for free
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 