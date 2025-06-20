import React from 'react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 'testimonial-1',
      name: 'Sarah Chen',
      role: 'Senior Product Manager',
      company: 'TechFlow',
      content: 'WordWise transformed how our team writes PRDs. The AI suggestions help us catch unclear requirements before they reach engineering. Our development cycles are 30% faster now.',
      avatar: 'SC'
    },
    {
      id: 'testimonial-2',
      name: 'Marcus Rodriguez',
      role: 'Staff Software Engineer',
      company: 'DataStream',
      content: 'Finally, a writing tool that understands technical documentation. The passive voice detection and clarity suggestions make my architecture docs actually readable.',
      avatar: 'MR'
    },
    {
      id: 'testimonial-3',
      name: 'Emily Watson',
      role: 'VP of Product',
      company: 'CloudScale',
      content: 'The strategic advisory comments are game-changing. WordWise helps me strengthen my arguments and present clearer roadmaps to executives.',
      avatar: 'EW'
    },
    {
      id: 'testimonial-4',
      name: 'David Kim',
      role: 'Principal Engineer',
      company: 'DevTools Inc',
      content: 'Code reviews used to be painful because of unclear descriptions. WordWise helps me write better PR comments and technical explanations.',
      avatar: 'DK'
    },
    {
      id: 'testimonial-5',
      name: 'Lisa Thompson',
      role: 'Product Manager',
      company: 'StartupCo',
      content: 'As a PM at a fast-growing startup, clear communication is critical. WordWise ensures my feature specs are understood by everyone on the team.',
      avatar: 'LT'
    },
    {
      id: 'testimonial-6',
      name: 'Alex Patel',
      role: 'Senior Engineer',
      company: 'FinTech Solutions',
      content: 'The AI rewrites are incredibly helpful for simplifying complex technical concepts. My documentation is now accessible to both technical and non-technical stakeholders.',
      avatar: 'AP'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Product and Engineering Teams
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how WordWise is helping teams write better, ship faster, and communicate more effectively.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-xl shadow-lg p-6 border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{testimonial.avatar}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 border">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-600">Documents Enhanced</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">2.5M+</div>
              <div className="text-gray-600">Suggestions Applied</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">89%</div>
              <div className="text-gray-600">Faster Review Cycles</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 