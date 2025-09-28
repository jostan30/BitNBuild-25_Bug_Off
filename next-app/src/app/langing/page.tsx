'use client';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import StorySection from '@/components/StorySection';
import StageReveal from '@/components/StageReveal';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <Header />
      <HeroSection />
      <StorySection />
      <StageReveal />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
