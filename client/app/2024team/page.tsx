'use client';

import { useState, useEffect } from 'react';
import TeamSection from '../components/sections/TeamSection';
import SliderCSS from '../components/layout/SliderCSS';
import { useTeamByYear } from '../hooks/useBandsTeam';

export default function Team2024() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const { cores, coordinators, crew, mentors, loading, error } = useTeamByYear(2024);

  useEffect(() => {
    setIsClient(true);
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-red-400 p-8 bg-red-900/20 rounded-lg max-w-2xl mx-auto">
          <p className="text-xl mb-2">Failed to load team members</p>
          <p className="text-sm">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="overflow-hidden">
      {isClient && <SliderCSS />}
      <TeamSection 
        windowWidth={windowWidth} 
        isClient={isClient}
        coreMembers={cores}
        coordinators={coordinators}
        crew={crew}
        mentors={mentors}
        mentorsAsCarousel={true}
      />
    </main>
  );
} 