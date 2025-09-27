'use client';
import { motion } from 'framer-motion';
import AnimatedButton from './AnimatedButton';
import ParticleLayer from './ParticleLayer';
import Link from 'next/link';

export default function StageReveal() {
  return (
    <section id="features" className="relative py-32 h-screen flex items-center justify-center overflow-hidden">
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover -z-20 brightness-70"
      >
        <source src="/videos/stage-reveal.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-[#441111]/60 via-[#003447]/50 to-black/60 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="max-w-5xl mx-auto px-4 text-center text-white"
      >
        <motion.h2
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="text-4xl md:text-5xl font-bold mb-6 tracking-wider"
        >
          The Grand Reveal
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="text-xl md:text-2xl mb-12 leading-relaxed"
        >
          Step out into a vibrant festival of lights and music. Witness the magic of curated events that dazzle, entertain, and connect communities.
        </motion.p>
        <Link href="/register">
          <AnimatedButton>Join the Experience</AnimatedButton>
        </Link>
      </motion.div>

      <ParticleLayer count={60} color="#E34B26" />
      <ParticleLayer count={50} color="#F4FFEE" />
      <ParticleLayer count={40} color="#441111" />
    </section>
  );
}
