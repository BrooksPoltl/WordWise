import React from 'react';
import UserForm from './components/UserForm';

const App: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">WordWise</h1>
      </div>
      <UserForm />
    </div>
  </div>
);

export default App; 