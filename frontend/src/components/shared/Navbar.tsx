"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, login, logout, loading, isCreator, isBusiness, isAdmin } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async (role: string) => {
    setLoggingIn(true);
    try {
      await login(role);
      setShowRoleMenu(false);
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoggingIn(false);
    }
  };

  const roleColors: Record<string, string> = {
    creator: "#1B8E47",
    business: "#228BE6",
    admin: "#5F28A5",
  };

  // Role-based navigation links
  const getNavLinks = () => {
    if (!user) {
      return [
        { href: "/campaigns", label: "Campaigns" },
        { href: "/subscriptions", label: "Pricing" },
        { href: "/leaderboard", label: "Leaderboard" },
      ];
    }
    if (isAdmin) {
      return [
        { href: "/admin/campaigns", label: "Campaigns" },
        { href: "/admin/subscriptions", label: "Subscriptions" },
        { href: "/admin/flags", label: "Flags" },
        { href: "/admin/audit", label: "Audit" },
      ];
    }
    if (isBusiness) {
      return [
        { href: "/campaigns", label: "Campaigns" },
        { href: "/campaigns/create", label: "Create Campaign" },
      ];
    }
    // Creator
    return [
      { href: "/campaigns", label: "Campaigns" },
      { href: "/subscriptions", label: "Pricing" },
      { href: "/earnings", label: "Earnings" },
      { href: "/leaderboard", label: "Leaderboard" },
    ];
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <img src="/hookik-logo.png" alt="Hookik" className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {getNavLinks().map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: roleColors[user.role] || "#5F28A5" }}
                >
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </span>
                  {user.role}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                    <p className="px-4 py-1 text-xs text-gray-400 font-medium">Switch Role</p>
                    {["creator", "business", "admin"].map((role) => (
                      <button
                        key={role}
                        onClick={() => handleLogin(role)}
                        disabled={loggingIn}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize ${
                          user.role === role ? "font-bold" : ""
                        }`}
                        style={user.role === role ? { color: roleColors[role] } : {}}
                      >
                        {role === user.role ? `● ${role}` : role}
                      </button>
                    ))}
                    <hr className="my-1" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleLogin("business")}
                disabled={loggingIn || loading}
                className="btn-primary text-sm"
              >
                {loggingIn ? "Signing in..." : "Dev Login"}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
