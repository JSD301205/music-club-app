'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import the MusicNotesAnimation component with no SSR
const MusicNotesAnimation = dynamic(
  () => import('../ui/MusicNotesAnimation'),
  { 
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />
  }
);

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center hero-gradient text-white overflow-hidden">
      {/* 3D Music Notes Animation */}
      <div className="absolute inset-0 z-0">
        <MusicNotesAnimation />
      </div>

      {/* Animated background particles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/30 to-secondary-900/30" />
        <Image
          src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
          alt="Music Club"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
          className="opacity-40 animate-pulse-slow"
        />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 via-transparent to-secondary-900/20 animate-gradient-x" />
      </div>

      <div className="container mx-auto px-4 md:px-6 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Music Club IIITDM
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Uniting talents, creating harmony, and fostering a vibrant musical community at IIITDM Kancheepuram
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link 
              href="2025events" 
              className="btn-primary bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Upcoming Events
            </Link>
            <Link 
              href="auth/login" 
              className="btn-primary bg-secondary-600 hover:bg-secondary-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Join the Community
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
    </section>
  );
};

export default HeroSection;
