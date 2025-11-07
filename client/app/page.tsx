'use client';

import { useState, useEffect } from 'react';
import HeroSection from './components/sections/HeroSection';
import AboutSection from './components/sections/AboutSection';
import AnnouncementsSection from './components/sections/AnnouncementsSection';
import GallerySection from './components/sections/GallerySection';
import JoinUsSection from './components/sections/JoinUsSection';
import ContactSection from './components/sections/ContactSection';
import SliderCSS from './components/layout/SliderCSS';
import { galleryItems } from './data/gallery2025';

export default function Home() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [activeGalleryFilter, setActiveGalleryFilter] = useState('all'); // ✅ Define state for Gallery filter

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);

    // Set window width on client side
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main className="overflow-hidden">
      {/* Import slider CSS on client side */}
      {isClient && <SliderCSS />}

      <HeroSection />
      <AboutSection />
      <AnnouncementsSection />
      <GallerySection 
        activeFilter={activeGalleryFilter} 
        setActiveFilter={setActiveGalleryFilter}
        items={galleryItems}
      />
      <JoinUsSection />
      <ContactSection />
    </main>
  );
}
