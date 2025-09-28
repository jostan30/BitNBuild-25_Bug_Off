'use client';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface AnimatedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
}

export default function AnimatedButton({ children, variant = 'primary' }: AnimatedButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        className={`px-8 py-4 text-lg font-semibold rounded-lg flex items-center justify-center shadow-lg ${
          variant === 'primary'
            ? 'bg-gradient-to-r from-[#E34B26] to-[#F4FFEE] text-black hover:shadow-2xl'
            : 'border-white text-white hover:bg-white/10'
        }`}
      >
        {children}
      </Button>
    </motion.div>
  );
}
