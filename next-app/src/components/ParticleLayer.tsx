'use client';
import { motion } from 'framer-motion';

interface ParticleLayerProps {
  count?: number;
  color?: string;
}

export default function ParticleLayer({ count = 50, color = '#F4FFEE' }: ParticleLayerProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, Math.random() * 100, 0], x: [0, Math.random() * 100, 0] }}
          transition={{ duration: Math.random() * 5 + 3, repeat: Infinity }}
          className={`absolute w-[${Math.random() * 3 + 1}px] h-[${Math.random() * 3 + 1}px] rounded-full`}
          style={{
            backgroundColor: color,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.3,
          }}
        />
      ))}
    </>
  );
}
