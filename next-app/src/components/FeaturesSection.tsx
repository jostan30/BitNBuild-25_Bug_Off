'use client';
import { motion } from 'framer-motion';
import { FaMusic, FaLightbulb, FaUsers } from 'react-icons/fa';

const features = [
  { icon: <FaMusic />, title: 'Live Performances', desc: 'Experience immersive music, art, and dance shows.' },
  { icon: <FaLightbulb />, title: 'Creative Workshops', desc: 'Participate in hands-on workshops to ignite creativity.' },
  { icon: <FaUsers />, title: 'Networking', desc: 'Connect with like-minded individuals and creators.' },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-32 bg-black/80 text-white overflow-hidden">
      <motion.div className="max-w-6xl mx-auto px-4 text-center">
        <motion.h2 className="text-4xl md:text-5xl font-bold mb-12">Why Spectrate?</motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: i * 0.3 }}
              className="p-8 bg-gradient-to-r from-[#441111]/40 to-[#E34B26]/40 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-200">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
