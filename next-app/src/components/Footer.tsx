'use client';
import { FaArrowUp } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-gray-900 text-white py-16 text-center relative overflow-hidden">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-1 h-1 bg-[#E34B26] rounded-full top-10 left-20 opacity-50"
      />
      <p className="text-gray-400 mb-4">&copy; 2025 Spectrate. All rights reserved.</p>
      <button
        onClick={scrollToTop}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E34B26] to-[#F4FFEE] text-black px-4 py-2 rounded-lg hover:shadow-xl transition-all"
      >
        <FaArrowUp /> Back to Top
      </button>
    </footer>
  );
}
