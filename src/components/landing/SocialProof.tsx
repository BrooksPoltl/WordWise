import React from 'react';

const SocialProof: React.FC = () => (
  <section className="py-12 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-gray-500 text-sm font-medium mb-8">
          Trusted by teams at leading companies
        </p>
        <div className="flex justify-center items-center space-x-12 opacity-60">
          <div className="text-gray-400 font-bold text-xl">Microsoft</div>
          <div className="text-gray-400 font-bold text-xl">Google</div>
          <div className="text-gray-400 font-bold text-xl">Meta</div>
          <div className="text-gray-400 font-bold text-xl">Stripe</div>
          <div className="text-gray-400 font-bold text-xl">Notion</div>
        </div>
      </div>
    </div>
  </section>
);

export default SocialProof; 