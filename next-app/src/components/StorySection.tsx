'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import AnimatedButton from './AnimatedButton';
import ParticleLayer from './ParticleLayer';
import Link from 'next/link';

export default function StorySection() {
  const { scrollY } = useScroll();
  const storyY = useTransform(scrollY, [400, 1200], [0, -100]);
  const opacity = useTransform(scrollY, [400, 1200], [0, 1]);

  return (
    <section id="story" className="relative py-32 h-screen flex items-center justify-center overflow-hidden">
      <motion.video
        autoPlay
        loop
        muted
        style={{ scale: 1.05 }}
        className="absolute top-0 left-0 w-full h-full object-cover -z-20 brightness-75"
      >
        <source src="/videos/cave-depth.mp4" type="video/mp4" />
      </motion.video>

      <div className="absolute inset-0 bg-gradient-to-b from-[#003447]/60 via-[#441111]/40 to-black/60 -z-10" />

      <motion.div
        style={{ y: storyY, opacity }}
        className="max-w-4xl mx-auto px-4 text-center text-white"
      >
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="text-4xl md:text-5xl font-bold mb-6 tracking-wide"
        >
          Venture Deeper
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="text-xl md:text-2xl mb-12 leading-relaxed"
        >
          Move deeper into the experience. Each scroll takes you closer to hidden stages, exclusive events, and unforgettable memories.
        </motion.p>
        <Link href="/register">
          <AnimatedButton>Explore Events</AnimatedButton>
        </Link>
      </motion.div>

      <ParticleLayer count={40} color="#E34B26" />
      <ParticleLayer count={30} color="#F4FFEE" />
      <ParticleLayer count={20} color="#441111" />
    </section>
  );
}
