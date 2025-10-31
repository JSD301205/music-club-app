'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { merakiBands } from '../../data/bands';
import AnimatedSection from '../../components/layout/AnimatedSection';

export default function BandsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <AnimatedSection id="bands-page" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
              Bands of Meraki 2024
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Meet the incredible bands that rocked Spooky Symphonies at Meraki 2024
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {merakiBands.map((band, index) => (
              <motion.div
                key={band.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="aspect-square relative group">
                  <Image
                    src={band.image}
                    alt={band.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-2xl font-bold text-white text-center px-4">{band.name}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Decorative elements */}
          <div className="fixed top-20 left-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl animate-float" />
          <div className="fixed bottom-20 right-10 w-40 h-40 bg-secondary-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
      </AnimatedSection>
    </main>
  );
} 