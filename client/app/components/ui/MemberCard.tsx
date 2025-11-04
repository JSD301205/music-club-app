'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaInstagram, FaChevronRight } from 'react-icons/fa';
import { TeamMember } from '../../data/team';
import { fetchUsernameMappings, getUsernameFromName } from '../../utils/nameToUsername';
import { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase-client';

interface MemberCardProps {
  member: TeamMember;
}

const MemberCard = ({ member }: MemberCardProps) => {
  const [isProfileVisible, setIsProfileVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const initializeCard = async () => {
      try {
        // Fetch username mappings from database
        const mappings = await fetchUsernameMappings();
        const resolvedUsername = getUsernameFromName(member.name, mappings);
        setUsername(resolvedUsername);

        if (!resolvedUsername) {
          setIsLoading(false);
          return;
        }

        // Check profile visibility
        const { data, error } = await supabase
          .from('profiles')
          .select('is_visible_in_community')
          .eq('username', resolvedUsername)
          .single();

        if (error) {
          console.warn(`Profile not found for username: ${resolvedUsername}`);
          setIsProfileVisible(false);
        } else {
          setIsProfileVisible((data as { is_visible_in_community: boolean })?.is_visible_in_community ?? false);
        }
      } catch (err) {
        console.error('Error initializing member card:', err);
        setIsProfileVisible(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCard();
  }, [member.name]);

  const canLinkToProfile = username && isProfileVisible && !isLoading;
  const profileUrl = canLinkToProfile ? `/community/${username}` : null;

  const CardContent = () => (
    <motion.div
      whileHover={canLinkToProfile ? { y: -5 } : {}}
      className={`group bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 ${
        canLinkToProfile ? 'cursor-pointer' : ''
      }`}
    >
      <div className="aspect-square relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent z-10" />
        <Image
          src={member.image}
          alt={member.name}
          fill
          style={{ objectFit: 'cover' }}
          className={`rounded-t-2xl transform transition-transform duration-700 ${
            canLinkToProfile ? 'group-hover:scale-110' : ''
          }`}
        />
        {canLinkToProfile && (
          <div className="absolute top-4 right-4 z-20 bg-primary-500/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FaChevronRight className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      <div className="p-6 text-center space-y-4">
        <div>
          <h3 className={`text-xl font-bold text-white transition-colors duration-300 ${
            canLinkToProfile ? 'group-hover:text-primary-400' : ''
          }`}>
            {member.name}
          </h3>
          <p className="text-primary-400 font-medium">{member.role}</p>
        </div>
        
        <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>
        
        {/* Social Links */}
        <div className="flex justify-center space-x-4 pt-2" onClick={(e) => e.stopPropagation()}>
          {member.social?.github && (
            <motion.a
              href={member.social.github}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <FaGithub className="w-5 h-5" />
            </motion.a>
          )}
          {member.social?.linkedin && (
            <motion.a
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <FaLinkedin className="w-5 h-5" />
            </motion.a>
          )}
          {member.social?.instagram && (
            <motion.a
              href={member.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <FaInstagram className="w-5 h-5" />
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (profileUrl) {
    return (
      <Link href={profileUrl} className="block">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

export default MemberCard;