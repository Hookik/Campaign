/**
 * Hookik Landing Page
 * The first impression — tells the story of Nigeria's creator economy platform.
 * Two audiences: Brands looking for creators, Creators looking for opportunities.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  DEMO_CAMPAIGNS, DEMO_CREATORS, PLATFORM_STATS, TESTIMONIALS,
  formatNaira, formatCompact, formatFollowers, getNicheIcon, getPlatformIcon,
} from '@/lib/demoData';

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'creators' | 'brands'>('creators');

  const featuredCampaigns = DEMO_CAMPAIGNS.filter(c => c.status === 'published').slice(0, 3);
  const topCreators = DEMO_CREATORS.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="container-app py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-purple-100 text-sm font-medium text-purple-700 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft"></span>
              Nigeria&apos;s #1 Creator Collaboration Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6" style={{ color: '#1A1D23' }}>
              Earn <span style={{ color: '#5F28A5' }}>Campaign Fees</span> +{' '}
              <span style={{ color: '#1B8E47' }}>Ongoing Commission</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              The only platform where creators earn upfront campaign fees AND ongoing affiliate commission on every sale.
              Brands get authentic content that actually drives revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/campaigns" className="btn-primary btn-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z