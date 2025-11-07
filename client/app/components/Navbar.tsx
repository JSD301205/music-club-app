'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import ProfileDropdown from './auth/ProfileDropdown';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  // Use optional chaining with fallback
  const authContext = useAuth();
  const user = authContext?.user ?? null;
  const loading = authContext?.loading ?? false;

  // Track if we've confirmed no user (to prevent flickering)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!loading) {
      setHasCheckedAuth(true);
    }
  }, [loading]);

  // Only consider user as "logged in" if user exists AND has an id
  const isAuthenticated = !!(user && user.id);

  // Debug logging - Commented out to prevent exposing user data in production
  // useEffect(() => {
  //   console.log('Navbar - User:', user);
  //   console.log('Navbar - Is Authenticated:', isAuthenticated);
  //   console.log('Navbar - Loading:', loading);
  //   console.log('Navbar - Has Checked Auth:', hasCheckedAuth);
  // }, [user, loading, isAuthenticated, hasCheckedAuth]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: pathname === '/' ? '#about' : '/#about' },
    { name: 'Events', href: '/events' },
    { name: 'Team', href: '/team' },
    { name: 'Gallery', href: '/gallery' },
  ];

  const servicesLinks = [
    { name: 'Community Hub', href: '/community', icon: '👥' },
    { name: 'Jam Board', href: '/jam-board', icon: '🎵' },
    { name: 'Room Booking', href: '/bookings', icon: '🚪' },
    { name: 'Equipment', href: '/equipment', icon: '🎸' },
    { name: 'Resources', href: '/resources', icon: '📚' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-gray-900/50'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo/Culturals.png"
              alt="Cultural Logo"
              width={40}
              height={40}
              className="h-20 w-auto"
            />
            <Image
              src="/logo/Music_Club_Logo_2025-26_NoBG.png"
              alt="Music Club Logo"
              width={60}
              height={60}
              className="w-19 h-19"
            />
            <span className="text-xl font-bold text-white">Music Club</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
            
            {/* Services Dropdown */}
            <div className="relative" ref={servicesRef}>
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors duration-300"
              >
                <span>Services</span>
                <FaChevronDown className={`text-xs transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl overflow-hidden"
                  >
                    {servicesLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                        onClick={() => setServicesOpen(false)}
                      >
                        <span className="text-xl">{link.icon}</span>
                        <span>{link.name}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Contact Link */}
            <Link
              href={pathname === '/' ? '#contact' : '/#contact'}
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Contact
            </Link>
            
            {/* Auth Section - Always Visible */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <ProfileDropdown />
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-300 hover:text-white transition-colors duration-300 whitespace-nowrap"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden py-4 absolute top-20 left-0 right-0 bg-gray-900/95 backdrop-blur-md shadow-lg z-50"
          >
            <div className="container mx-auto px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block py-2 text-gray-300 hover:text-white transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Mobile Services Section */}
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-2">Services</p>
                {servicesLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center space-x-3 py-2 text-gray-300 hover:text-white transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
              
              {/* Mobile Contact Link */}
              <Link
                href={pathname === '/' ? '#contact' : '/#contact'}
                className="block py-2 text-gray-300 hover:text-white transition-colors duration-300 mt-2 pt-2 border-t border-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <Link
                    href={`/community/${user.email?.split('@')[0]}`}
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/community/messages"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link
                    href="/settings"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                  <Link
                    href="/auth/login"
                    className="block py-2 text-gray-300 hover:text-white transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-center transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;