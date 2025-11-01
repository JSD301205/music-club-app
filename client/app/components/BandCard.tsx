'use client';

import Image from 'next/image';
import { BandWithMembers } from '../types/bands-team.types';
import { useState } from 'react';

interface BandCardProps {
  band: BandWithMembers;
}

export default function BandCard({ band }: BandCardProps) {
  const [activeMember, setActiveMember] = useState<number | null>(null);

  return (
    <div className="w-full bg-zinc-900 rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left side - Band members grid */}
        <div className="md:w-1/2">
          <div className="grid grid-cols-3 gap-2">
            {band.band_members?.map((member) => (
              <div 
                key={member.id} 
                className="relative aspect-square w-full group overflow-hidden"
                onClick={() => setActiveMember(activeMember === member.id ? null : member.id)}
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover rounded-sm transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 33vw, 16vw"
                />
                {/* Overlay with member info */}
                <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
                  activeMember === member.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className={`absolute inset-0 flex flex-col items-center justify-center text-white text-center p-2 transition-transform duration-300 ${
                    activeMember === member.id ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'
                  }`}>
                    <p className="font-medium text-sm break-words w-full px-2">{member.name}</p>
                    <p className="text-xs text-gray-300 break-words w-full px-2">{member.instrument}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Band info */}
        <div className="md:w-1/2 flex flex-col">
          <h2 className="text-3xl font-bold mb-4 text-white">{band.name}</h2>
          <p className="text-gray-300 mb-6">{band.description}</p>
          
          <h3 className="text-xl font-semibold mb-3 text-white">Members</h3>
          <div className="grid grid-cols-1 gap-2">
            {band.band_members?.map((member) => (
              <div key={member.id} className="flex items-center text-gray-300">
                <span className="font-medium">{member.name}</span>
                <span className="mx-2">•</span>
                <span className="text-gray-400">{member.instrument}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 