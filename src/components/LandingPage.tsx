import React from 'react';
import AIAdvisorySection from './landing/AIAdvisorySection';
import AIRewritesSection from './landing/AIRewritesSection';
import CTASection from './landing/CTASection';
import Footer from './landing/Footer';
import HeroSection from './landing/HeroSection';
import Navbar from './landing/Navbar';
import SocialProof from './landing/SocialProof';
import StyleEnhancementSection from './landing/StyleEnhancementSection';
import TargetAudienceSection from './landing/TargetAudienceSection';
import TestimonialsSection from './landing/TestimonialsSection';

const LandingPage: React.FC = () => (
  <div className="min-h-screen bg-white">
    <Navbar />
    <main>
      <HeroSection />
      <SocialProof />
      <StyleEnhancementSection />
      <AIRewritesSection />
      <AIAdvisorySection />
      <TargetAudienceSection />
      <TestimonialsSection />
      <CTASection />
    </main>
    <Footer />
  </div>
);

export default LandingPage; 