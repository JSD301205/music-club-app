'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useBands } from '../../hooks/useBandsTeam';
import AnimatedSection from '../../components/layout/AnimatedSection';

export default function BandsPage() {
  // Fetch only specific bands that performed at Meraki 2024
  const { bands, loading, error } = useBands({ is_published: true });
  
  // Filter for Meraki 2024 bands (you can add a 'tags' or 'event' field to the database later)
  // For now, we'll show all bands or you can filter by specific names
  const merakiBandNames = ['SOULROCK', 'DreamPie', 'Just For You All', 'Rhythm Pulse', 'Melody Waves', 'Sanchari'];
  const merakiBands = bands.filter(band => 
    merakiBandNames.some(name => band.name.toLowerCase().includes(name.toLowerCase()))
  );

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

          {loading && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-400 p-8 bg-red-900/20 rounded-lg max-w-2xl mx-auto">
              <p className="text-xl mb-2">Failed to load bands</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
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
          )}

          {/* Decorative elements */}
          <div className="fixed top-20 left-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl animate-float" />
          <div className="fixed bottom-20 right-10 w-40 h-40 bg-secondary-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
      </AnimatedSection>
    </main>
  );
} 