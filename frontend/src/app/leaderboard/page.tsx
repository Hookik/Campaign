"use client";

import React, { useState } from "react";

type TimeRange = "weekly" | "monthly" | "alltime";
type Category = "all" | "fashion" | "tech" | "beauty" | "food" | "lifestyle";

interface LeaderboardCreator {
  rank: number;
  name: string;
  handle: string;
  avatar: string;
  tier: "free" | "pro" | "pro_plus";
  is_verified: boolean;
  campaigns_completed: number;
  total_earned: number;
  avg_rating: number;
  niche: string;
}

// Demo data for the leaderboard
const DEMO_CREATORS: LeaderboardCreator[] = [
  { rank: 1, name: "Adaeze Obi", handle: "@adaeze_style", avatar: "", tier: "pro_plus", is_verified: true, campaigns_completed: 32, total_earned: 1450000, avg_rating: 4.9, niche: "fashion" },
  { rank: 2, name: "Tunde Bakare", handle: "@tunde_tech", avatar: "", tier: "pro_plus", is_verified: true, campaigns_completed: 28, total_earned: 1280000, avg_rating: 4.8, niche: "tech" },
  { rank: 3, name: "Fatima Abdullahi", handle: "@fatima_beauty", avatar: "", tier: "pro", is_verified: true, campaigns_completed: 25, total_earned: 980000, avg_rating: 4.9, niche: "beauty" },
  { rank: 4, name: "Chinedu Eze", handle: "@chinedu_eats", avatar: "", tier: "pro", is_verified: true, campaigns_completed: 22, total_earned: 850000, avg_rating: 4.7, niche: "food" },
  { rank: 5, name: "Ngozi Okafor", handle: "@ngozi_life", avatar: "", tier: "pro", is_verified: false, campaigns_completed: 20, total_earned: 720000, avg_rating: 4.6, niche: "lifestyle" },
  { rank: 6, name: "Emeka Nwosu", handle: "@emeka_fit", avatar: "", tier: "pro", is_verified: true, campaigns_completed: 18, total_earned: 680000, avg_rating: 4.8, niche: "lifestyle" },
  { rank: 7, name: "Amina Yusuf", handle: "@amina_glow", avatar: "", tier: "free", is_verified: false, campaigns_completed: 15, total_earned: 520000, avg_rating: 4.5, niche: "beauty" },
  { rank: 8, name: "Oluwaseun Adeyemi", handle: "@seun_cooks", avatar: "", tier: "pro", is_verified: true, campaigns_completed: 14, total_earned: 480000, avg_rating: 4.7, niche: "food" },
  { rank: 9, name: "Blessing Ike", handle: "@blessingfashion", avatar: "", tier: "free", is_verified: false, campaigns_completed: 12, total_earned: 350000, avg_rating: 4.4, niche: "fashion" },
  { rank: 10, name: "Yemi Alade", handle: "@yemi_gadgets", avatar: "", tier: "pro_plus", is_verified: true, campaigns_completed: 11, total_earned: 320000, avg_rating: 4.9, niche: "tech" },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#7C4D00" }}>1</div>;
  if (rank === 2) return <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #C0C0C0, #A0A0A0)", color: "#4A4A4A" }}>2</div>;
  if (rank === 3) return <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #CD7F32, #A0522D)", color: "#FFF" }}>3</div>;
  return <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-500">{rank}</div>;
}

function TierBadge({ tier }: { tier: string }) {
  if (tier === "pro_plus") return <span className="badge-pro-plus">Pro+</span>;
  if (tier === "pro") return <span className="badge-pro">Pro</span>;
  return null;
}

export default function LeaderboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [category, setCategory] = useState<Category>("all");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);

  const filtered = category === "all"
    ? DEMO_CREATORS
    : DEMO_CREATORS.filter((c) => c.niche === category);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2" style={{ color: "#5F28A5" }}>
          Creator Leaderboard
        </h1>
        <p className="text-gray-500 text-lg">Top-ranked creators on the Hookik platform</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
        {/* 2nd Place */}
        <div className="flex flex-col items-center pt-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2" style={{ background: "linear-gradient(135deg, #C0C0C0, #A0A0A0)" }}>
            {DEMO_CREATORS[1]?.name.charAt(0)}
          </div>
          <p className="font-semibold text-gray-900 text-sm text-center">{DEMO_CREATORS[1]?.name}</p>
          <p className="text-xs text-gray-400">{DEMO_CREATORS[1]?.handle}</p>
          <p className="text-sm font-bold mt-1" style={{ color: "#5F28A5" }}>{formatCurrency(DEMO_CREATORS[1]?.total_earned || 0)}</p>
          <div className="w-full h-24 rounded-t-lg mt-2" style={{ backgroundColor: "#E8E8E8" }} />
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2" style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)" }}>
            {DEMO_CREATORS[0]?.name.charAt(0)}
          </div>
          <p className="font-bold text-gray-900 text-center">{DEMO_CREATORS[0]?.name}</p>
          <p className="text-xs text-gray-400">{DEMO_CREATORS[0]?.handle}</p>
          <p className="text-sm font-bold mt-1" style={{ color: "#5F28A5" }}>{formatCurrency(DEMO_CREATORS[0]?.total_earned || 0)}</p>
          <div className="w-full h-32 rounded-t-lg mt-2" style={{ backgroundColor: "#FFD700" }} />
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center pt-12">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold mb-2" style={{ background: "linear-gradient(135deg, #CD7F32, #A0522D)" }}>
            {DEMO_CREATORS[2]?.name.charAt(0)}
          </div>
          <p className="font-semibold text-gray-900 text-sm text-center">{DEMO_CREATORS[2]?.name}</p>
          <p className="text-xs text-gray-400">{DEMO_CREATORS[2]?.handle}</p>
          <p className="text-sm font-bold mt-1" style={{ color: "#5F28A5" }}>{formatCurrency(DEMO_CREATORS[2]?.total_earned || 0)}</p>
          <div className="w-full h-16 rounded-t-lg mt-2" style={{ backgroundColor: "#CD7F32" }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {(["weekly", "monthly", "alltime"] as TimeRange[]).map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeRange === t ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={timeRange === t ? { backgroundColor: "#5F28A5" } : {}}
            >
              {t === "alltime" ? "All Time" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="all">All Categories</option>
          <option value="fashion">Fashion</option>
          <option value="tech">Tech</option>
          <option value="beauty">Beauty</option>
          <option value="food">Food</option>
          <option value="lifestyle">Lifestyle</option>
        </select>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b" style={{ backgroundColor: "#F2F5FF" }}>
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rank</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Creator</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Niche</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Campaigns</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Earned</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((creator) => (
              <tr key={creator.rank} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <RankBadge rank={creator.rank} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: "#5F28A5" }}>
                      {creator.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{creator.name}</span>
                        <TierBadge tier={creator.tier} />
                        {creator.is_verified && (
                          <svg className="w-4 h-4" style={{ color: "#5F28A5" }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{creator.handle}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-gray-500">{creator.niche}</td>
                <td className="px-4 py-3 text-center text-gray-700 font-medium">{creator.campaigns_completed}</td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: "#1B8E47" }}>
                  {formatCurrency(creator.total_earned)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium text-gray-700">{creator.avg_rating}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-10 p-8 rounded-xl" style={{ backgroundColor: "#F2F5FF" }}>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Want to climb the ranks?</h3>
        <p className="text-gray-500 mb-4">Complete more campaigns and upgrade to Pro for priority placement</p>
        <div className="flex items-center justify-center gap-4">
          <a href="/campaigns" className="btn-primary text-sm">Browse Campaigns</a>
          <a href="/subscriptions" className="btn-outline text-sm">Upgrade Plan</a>
        </div>
      </div>
    </div>
  );
}
