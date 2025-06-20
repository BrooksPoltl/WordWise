import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-lg">AlignWrite</span>
        </div>
        <p className="text-sm text-gray-400">
          © 2024 AlignWrite. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer; 