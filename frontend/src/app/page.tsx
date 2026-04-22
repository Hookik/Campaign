"use client";
import Link from "next/link";

const features = [
  {
    title: "Browse Campaigns",
    desc: "Discover paid collaboration opportunities from top brands",
    href: "/campaigns",
    icon: "🎯",
  },
  {
    title: "Create Campaign",
    desc: "Launch a campaign and find the perfect creators",
    href: "/campaigns/create",
    icon: "🚀",
  },
  {
    title: "Subscription Plans",
    desc: "Unlock premium features with Pro & Pro+",
    href: "/subscriptions",
    icon: "⭐",
  },
  {
    title: "Earnings Dashboard",
    desc: "Track all your income in one place",
    href: "/earnings",
    icon: "💰",
  },
  {
    title: "Creator Leaderboard",
    desc: "See top-ranked creators on the platform",
    href: "/leaderboard",
    icon: "🏆",
  },
  {
    title: "Admin Panel",
    desc: "Moderate campaigns, subscriptions & flags",
    href: "/admin/campaigns",
    icon: "⚙️",
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#5F28A5' }}>
            Hookik Campaign Platform
          </h1>
          <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
            Paid Campaigns &amp; Creator Subscriptions — connect brands with creators for powerful collaborations
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/campaigns" className="btn-primary text-lg px-8 py-3">
              Browse Campaigns
            </Link>
            <Link href="/campaigns/create" className="btn-outline text-lg px-8 py-3">
              Create Campaign
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Link key={f.href} href={f.href} className="card p-6 block">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{f.title}</h2>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
