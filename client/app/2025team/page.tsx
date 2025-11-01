'use client';

import { useState, useEffect } from 'react';
import TeamSection from '../components/sections/TeamSection';
import SliderCSS from '../components/layout/SliderCSS';
import { useTeamMembers } from '../hooks/useBandsTeam';

export default function Team2025() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  // Fetch all team members for 2025
  const { teamMembers, loading, error } = useTeamMembers({ 
    year: 2025,
    is_published: true 
  });

  // Group by category
  const coreMembers = teamMembers.filter(m => m.category === 'core' || m.role?.toLowerCase().includes('core'));
  
  // Leads: Look for role='Lead' OR position contains 'Lead' OR category='lead'
  const leads = teamMembers.filter(m => 
    m.role?.toLowerCase() === 'lead' || 
    m.position?.toLowerCase().includes('lead') ||
    m.category?.toLowerCase() === 'lead'
  );
  
  const coordinators = teamMembers.filter(m => 
    m.category === 'coordinator' || 
    m.role?.toLowerCase().includes('coordinator')
  );
  
  const crew = teamMembers.filter(m => 
    m.category === 'crew' || 
    m.role?.toLowerCase().includes('crew')
  );
  
  const mentors = teamMembers.filter(m => 
    (m.category === 'mentor' || m.role?.toLowerCase().includes('mentor')) && 
    !m.role?.toLowerCase().includes('external')
  );
  
  const externalMentors = teamMembers.filter(m => 
    m.role?.toLowerCase().includes('external mentor') ||
    m.position?.toLowerCase().includes('external mentor')
  );

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
        coreMembers={coreMembers}
        leads={leads}
        coordinators={coordinators}
        crew={crew}
        mentors={mentors}
        externalMentors={externalMentors}
        mentorsAsCarousel={true}
      />
    </main>
  );
} 