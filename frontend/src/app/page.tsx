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

        {/* Creator Photo Marquee — auto-scrolling, pausable on hover */}
        <div className="marquee pb-16">
          <div className="marquee-track" style={{ gap: '1rem' }}>
            {marqueeCreators.map((creator, i) => {
              const heights = [280, 340, 300, 320, 260, 310, 290, 330];
              const h = heights[i % heights.length];
              return (
                <div
                  key={`${creator.id}-${i}`}
                  className="relative rounded-2xl overflow-hidden shadow-lg flex-shrink-0 group cursor-pointer"
                  style={{ width: '200px', height: `${h}px` }}
                >
                  <img
                    src={`https://picsum.photos/seed/hookik-creator-${i % 8}/400/${h * 2}`}
                    alt={creator.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 transform group-hover:translate-y-0 translate-y-1 transition-transform">
                    <p className="text-white font-bold text-sm">{creator.name}</p>
                    <p className="text-white/60 text-xs font-light">{getNicheIcon(creator.niche)} {creator.niche}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── VALUE PROP: Brands + Creators ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-app">
          <div className="max-w-4xl mx-auto text-center mb-16 reveal">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.95] mb-6 font-display" style={{ color: '#1A1D23' }}>
              Brands. Creators.<br />
              Nothing in between.
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Hookik removes the middlemen. Brands connect directly with creators who genuinely love their products.
              No agencies, no inflated fees — just authentic partnerships that drive real results.
            </p>
          </div>

          {/* Two-column feature */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="rounded-3xl p-8 md:p-10 reveal reveal-delay-1" style={{ background: '#F5F0FF' }}>
              <span className="text-3xl mb-4 block">🏢</span>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#5F28A5' }}>For Brands</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Launch campaigns in minutes. Set your budget, define deliverables, and let creators come to you.
                Review applications, approve content, and pay securely — all in one place.
              </p>
              <Link href="/campaigns/create" className="inline-flex items-center gap-2 font-semibold text-sm" style={{ color: '#5F28A5' }}>
                Create your first campaign
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
            <div className="rounded-3xl p-8 md:p-10 reveal reveal-delay-2" style={{ background: '#F0FDF4' }}>
              <span className="text-3xl mb-4 block">🎨</span>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#1B8E47' }}>For Creators</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Browse paid campaigns that match your niche. Apply with your best pitch, deliver great content,
                and earn campaign fees plus ongoing commission on every product sale through your storefront.
              </p>
              <Link href="/campaigns" className="inline-flex items-center gap-2 font-semibold text-sm" style={{ color: '#1B8E47' }}>
                Browse open campaigns
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HYBRID MODEL: Turning collaborations into businesses ─── */}
      <section className="py-20 md:py-28" style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #F5F0FF 100%)' }}>
        <div className="container-app">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left: Copy */}
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.95] mb-6 reveal font-display" style={{ color: '#1A1D23' }}>
                Turning collaborations into businesses
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-6">
                On Hookik, creators don&apos;t just get paid once. Our hybrid model means you earn a campaign fee
                <em> and</em> ongoing commission on every sale — turning one collaboration into a lasting revenue stream.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F5F0FF' }}>
                    <svg className="w-4 h-4" style={{ color: '#5F28A5' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Campaign fee paid upfront</p>
                    <p className="text-sm text-gray-500">Secured via escrow — released when content is approved</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F0FDF4' }}>
                    <svg className="w-4 h-4" style={{ color: '#1B8E47' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Ongoing affiliate commission</p>
                    <p className="text-sm text-gray-500">Products auto-added to your storefront — earn on every sale, forever</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#D0EBFF' }}>
                    <svg className="w-4 h-4" style={{ color: '#228BE6' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Transparent tracking</p>
                    <p className="text-sm text-gray-500">Real-time dashboard for earnings, sales, and campaign performance</p>
                  </div>
                </div>
              </div>
              <Link href="/campaigns" className="btn-primary">
                Start earning today
              </Link>
            </div>

            {/* Right: Earnings Dashboard mockup */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-900 p-1">
              <div className="rounded-2xl overflow-hidden bg-gray-900 p-5">
                {/* Mock dashboard header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-500 ml-2">Insights</span>
                </div>
                <div className="flex gap-4 mb-4">
                  {['Campaigns', 'Shop', 'Earnings', 'Posts'].map((tab, i) => (
                    <span key={tab} className={`text-xs pb-1 ${i === 2 ? 'text-white border-b border-white font-semibold' : 'text-gray-500'}`}>{tab}</span>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mb-1">Earnings this month</p>
                <p className="text-white text-3xl font-bold mb-4">{formatNaira(782_800)}</p>
                {/* Mini chart bars */}
                <div className="flex items-end gap-2 h-24 mb-4">
                  {[40, 65, 35, 55, 70, 50, 80, 60, 75, 45, 85, 55].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i >= 10 ? '#5F28A5' : i >= 8 ? '#8937CE' : '#3D3D5C' }} />
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { month: 'Apr 2026', amount: '₦782,800', status: 'In progress' },
                    { month: 'Mar 2026', amount: '₦170,600', status: '' },
                    { month: 'Feb 2026', amount: '₦131,400', status: '' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-t border-gray-800">
                      <div>
                        <p className="text-white text-sm">{row.month}</p>
                        {row.status && <p className="text-xs text-gray-500">{row.status}</p>}
                      </div>
                      <p className="text-white text-sm font-semibold">{row.amount} &rsaquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF: Stats ─── */}
      <section className="py-16 bg-white">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: formatFollowers(PLATFORM_STATS.totalCreators), label: 'Active creators' },
              { value: `${PLATFORM_STATS.totalBrands}+`, label: 'Brands' },
              { value: formatCompact(PLATFORM_STATS.totalPaidOut), label: 'Paid to creators' },
              { value: `${PLATFORM_STATS.totalCampaigns.toLocaleString()}+`, label: 'Campaigns launched' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-black" style={{ color: '#5F28A5' }}>{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 md:py-28" style={{ background: '#FAFAFA' }}>
        <div className="container-app">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-12 tracking-tight reveal font-display" style={{ color: '#1A1D23' }}>
            Hear it from them
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-600 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE CAMPAIGNS ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3 font-display" style={{ color: '#1A1D23' }}>
              Open collaborations
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">Brands are looking for creators right now. Find your next paid collaboration.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
            {campaigns.map((c) => (
              <Link key={c.id} href={`/campaigns/${c.id}`} className="group">
                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="relative h-44 overflow-hidden">
                    <img src={c.cover_image_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold leading-snug">{c.title}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={c.brand.logo} alt="" className="w-5 h-5 rounded-full" />
                      <span className="text-sm text-gray-600">{c.brand.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: '#5F28A5' }}>{c.fee_per_creator ? formatNaira(c.fee_per_creator) : `${formatNaira(c.fee_min || 0)}+`}</span>
                      {c.commission_on_top && <span className="text-sm font-bold" style={{ color: '#1B8E47' }}>+{c.commission_rate}%</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/campaigns" className="btn-secondary">
              View all campaigns
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-28" style={{ background: 'linear-gradient(180deg, #5F28A5 0%, #4A1F82 100%)' }}>
        <div className="container-app text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[0.95] mb-6">
            Your next collaboration<br />starts here
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
            Join {formatFollowers(PLATFORM_STATS.totalCreators)} creators and {PLATFORM_STATS.totalBrands}+ brands building authentic partnerships on Hookik.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/campaigns" className="bg-white text-purple-700 px-10 py-4 rounded-full font-bold text-base hover:bg-purple-50 transition inline-flex items-center justify-center gap-2 shadow-xl">
              Get started free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white border-t py-12">
        <div className="container-app">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <img src="/hookik-logo.png" alt="Hookik" className="h-7 mb-3" />
              <p className="text-sm text-gray-500 leading-relaxed">
                Nigeria&apos;s creator collaboration platform. Authentic partnerships between brands and creators.
              </p>
            </div>
            <div>
              <p className="font-bold text-sm mb-3">For Creators</p>
              <div className="space-y-2">
                <Link href="/campaigns" className="block text-sm text-gray-500 hover:text-purple-600 transition">Browse Campaigns</Link>
                <Link href="/my-applications" className="block text-sm text-gray-500 hover:text-purple-600 transition">My Applications</Link>
                <Link href="/earnings" className="block text-sm text-gray-500 hover:text-purple-600 transition">Earnings</Link>
                <Link href="/leaderboard" className="block text-sm text-gray-500 hover:text-purple-600 transition">Leaderboard</Link>
              </div>
            </div>
            <div>
              <p className="font-bold text-sm mb-3">For Brands</p>
              <div className="space-y-2">
                <Link href="/campaigns/create" className="block text-sm text-gray-500 hover:text-purple-600 transition">Create Campaign</Link>
                <Link href="/campaigns" className="block text-sm text-gray-500 hover:text-purple-600 transition">Manage Campaigns</Link>
              </div>
            </div>
            <div>
              <p className="font-bold text-sm mb-3">Company</p>
              <div className="space-y-2">
                <span className="block text-sm text-gray-500">About Hookik</span>
                <span className="block text-sm text-gray-500">Support</span>
                <span className="block text-sm text-gray-500">Terms of Service</span>
                <span className="block text-sm text-gray-500">Privacy Policy</span>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">&copy; 2026 Hookik. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span className="trust-badge text-xs">
                <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                Secure Payments
              </span>
              <span className="trust-badge text-xs">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Verified Creators
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
