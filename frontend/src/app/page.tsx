/**
 * Hookik Landing Page
 * Patreon-inspired design with bold typography, animated creator marquee,
 * scroll-reveal sections, and collaboration-focused copy.
 * Typography: Montserrat (Gotham Rounded substitute), weight 900 for headings.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  DEMO_CREATORS, DEMO_CAMPAIGNS, PLATFORM_STATS, TESTIMONIALS,
  formatNaira, formatCompact, formatFollowers, getNicheIcon,
} from '@/lib/demoData';

// Hook for scroll-triggered reveal animations
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const elements = ref.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function HomePage() {
  const { user } = useAuth();
  const creators = DEMO_CREATORS;
  const campaigns = DEMO_CAMPAIGNS.filter(c => c.status === 'published').slice(0, 3);
  const scrollRef = useScrollReveal();

  // Double the creators array for seamless marquee loop
  const marqueeCreators = [...creators, ...creators];

  return (
    <div className="min-h-screen" ref={scrollRef}>

      {/* ─── HERO: Bold Typography + Creator Grid ─── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F5F0FF 0%, #EDE5FF 40%, #E8DEFF 100%)' }}>
        <div className="container-app pt-16 pb-8 md:pt-24 md:pb-12">
          {/* Large bold headline */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6" style={{ color: '#1A1D23' }}>
              Collaborate.<br />
              <span style={{ color: '#5F28A5' }}>Create.</span><br />
              <span style={{ color: '#1B8E47' }}>Earn.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            