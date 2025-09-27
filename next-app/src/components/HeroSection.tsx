'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import AnimatedButton from './AnimatedButton';
import ParticleLayer from './ParticleLayer';
import Link from 'next/link';

export default function HeroSection() {
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.05]);
  const heroY = useTransform(scrollY, [0, 400], [0, -80]);

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center text-center overflow-hidden">
      <motion.video
        autoPlay
        loop
        muted
        style={{ scale: heroScale }}
        className="absolute top-0 left-0 w-full h-full object-cover -z-20 brightness-70"
      >
        <source src="/videos/hero-cave.mp4" type="video/mp4" />
      </motion.video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 -z-10" />

      <motion.div style={{ y: heroY }} className="px-4">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight"
        >
          Enter the <span className="bg-gradient-to-r from-[#E34B26] to-[#F4FFEE] bg-clip-text text-transparent">Mystical World of Events</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Walk through the entrance of unforgettable experiences. Discover events that captivate, engage, and inspire.
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/register">
            <AnimatedButton>Start Your Journey</AnimatedButton>
          </Link>
          <AnimatedButton variant="outline">Watch Demo</AnimatedButton>
        </div>
      </motion.div>

      {/* Particles */}
      <ParticleLayer count={50} color="#E34B26" />
      <ParticleLayer count={40} color="#F4FFEE" />
      <ParticleLayer count={30} color="#441111" />
    </section>
  );
}
