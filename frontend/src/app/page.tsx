/**
 * Hookik Landing Page
 * Patreon-inspired design with bold typography, creator grid,
 * and collaboration-focused copy. Hookik brand colors.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  DEMO_CREATORS, DEMO_CAMPAIGNS, PLATFORM_STATS, TESTIMONIALS,
  formatNaira, formatCompact, formatFollowers, getNicheIcon,
} from '@/lib/demoData';

export default function HomePage() {
  const { user } = useAuth();
  const creators = DEMO_CREATORS.slice(0, 6);
  const campaigns = DEMO_CAMPAIGNS.filter(c => c.status === 'published').slice(0, 3);

  return (
    <div className="min-h-screen">

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
              Hookik connects Nigerian brands with creators for authentic collaborations.
              Get paid for campaigns <em>and</em> earn ongoing commission on every sale.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/campaigns" className="btn-primary btn-lg text-base px-10">
                Start Collaborating
              </Link>
              <Link href="/campaigns/create" className="btn-secondary btn-lg text-base px-10">
                Launch a Campaign
              </Link>
            </div>
          </div>
        </div>

        {/* Creator Photo Grid — Patreon style */}
        <div className="relative w-full overflow-hidden pb-16">
          <div className="flex items-end justify-center gap-4 px-4 max-w-6xl mx-auto">
            {creators.map((creator, i) => {
              const heights = [2