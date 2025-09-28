'use client';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from './ui/button';
import { FaCheckCircle } from 'react-icons/fa';

export default function Header() {
  const { scrollY } = useScroll();
  const logoOpacity = useTransform(scrollY, [0, 200], [0, 1]);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <motion.div
              style={{ opacity: logoOpacity }}
              className="w-10 h-10 bg-gradient-to-r from-[#E34B26] to-[#F4FFEE] rounded-full flex items-center justify-center shadow-lg animate-pulse"
            >
              <FaCheckCircle className="text-white text-lg" />
            </motion.div>
            <span className="font-extrabold text-2xl text-gray-800 tracking-wider">
              Spectrate
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#hero" className="text-gray-700 hover:text-[#E34B26] transition">
              Home
            </Link>
            <Link href="#story" className="text-gray-700 hover:text-[#E34B26] transition">
              Story
            </Link>
            <Link href="#features" className="text-gray-700 hover:text-[#E34B26] transition">
              Features
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-[#E34B26] to-[#441111] text-white hover:shadow-xl transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
