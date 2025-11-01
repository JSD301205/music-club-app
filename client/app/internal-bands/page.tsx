'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useBandsWithMembers } from '../hooks/useBandsTeam';
import AnimatedSection from '../components/layout/AnimatedSection';

export default function InternalBandsPage() {
  const { bands, loading, error } = useBandsWithMembers({ is_published: true });

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <AnimatedSection id="internal-bands-page" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
              Music Club Bands
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Meet the talented bands that make up our Music Club community
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
            <div className="grid grid-cols-1 gap-10 max-w-5xl mx-auto">
              {bands.map((band, index) => (
              <motion.div
                key={band.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Left side - Member photos grid */}
                  <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                    <div className={`grid ${band.band_members?.length <= 6 ? 'grid-cols-3' : 'grid-cols-3'} gap-2 p-4 rounded-lg overflow-hidden w-full max-w-md`}>
                      {band.band_members?.map((member) => (
                        <div key={member.id} className="aspect-square relative overflow-hidden group">
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-white font-medium text-center px-2">{member.name}</p>
                            <p className="text-primary-300 text-sm text-center px-2">{member.instrument}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Right side - Band info */}
                  <div className="w-full md:w-1/2 p-8">
                    <h3 className="text-2xl font-bold text-white mb-3">{band.name}</h3>
                    <p className="text-gray-400 mb-5">{band.description}</p>
                    
                    <h4 className="text-lg font-semibold text-white mb-3">Members & Instruments</h4>
                    <ul className="list-disc pl-5 text-gray-300 space-y-2">
                      {band.band_members?.map((member) => (
                        <li key={member.id}>
                          <span className="font-medium">{member.name}</span> - <span className="text-gray-400">{member.instrument}</span>
                        </li>
                      ))}
                    </ul>
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