/**
 * Hookik Navbar
 * Responsive navigation with role-based links, mobile hamburger menu,
 * avatar dropdown with role switcher.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, login, logout, loading, isCreator, isBusiness, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogin = async (role: string) => {
    setLoggingIn(true);
    try {
      await login(role);
      setShowMenu(false);
      setShowMobile(false);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoggingIn(false);
    }
  };

  const roleColors: Record<string, string> = {
    creator: '#1B8E47',
    business: '#228BE6',
    admin: '#5F28A5',
  };

  const navLinks = (() => {
    if (!user) return [
      { href: '/campaigns', label: 'Campaigns' },
      { href: '/subscriptions', label: 'Pricing' },
      { href: '/leaderboard', label: 'Leaderboard' },
    ];
    if (isAdmin) return [
      { href: '/admin/campaigns', label: 'Campaigns' },
      { href: '/admin/subscriptions', label: 'Subscriptions' },
      { href: '/admin/flags', label: 'Flags' },
      { href: '/admin/audit', label: 'Audit' },
    ];
    if (isBusiness) return [
      { href: '/campaigns', label: 'Campaigns' },
      { href: '/campaigns/create', label: 'Create Campaign' },
    ];
    return [
      { href: '/campaigns', label: 'Campaigns' },
      { href: '/my-applications', label: 'My Applications' },
      { href: '/earnings', label: 'Earnings' },
      { href: '/leaderboard', label: 'Leaderboard' },
    ];
  })();

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="container-app">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex-shrink-0">
              <img src="/hookik-logo.png" alt="Hookik" className="h-7 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: roleColors[user.role] || '#5F28A5' }}
                  >
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                      {user.name?.charAt(0) || '?'}
                    </span>
                    <span className="hidden sm:inline">{user.role}</span>
                    <svg className={`w-3.5 h-3.5 transition ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border py-1 z-50 animate-fadeIn">
                      <div className="px-4 py-3 border-b">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <div className="py-1 border-b">
                        <p className="px-4 py-1.5 text-xs text-gray-400 font-medium">Switch Role</p>
                        {['creator', 'business', 'admin'].map((role) => (
                          <button
                            key={role}
                            onClick={() => handleLogin(role)}
                            disabled={loggingIn}
                            className="w-full text-left px-4 py-2 text-sm ho