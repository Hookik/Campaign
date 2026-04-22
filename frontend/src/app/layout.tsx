import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hookik Campaign",
  description: "Hookik Paid Campaigns & Creator Subscriptions",
};

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold" style={{ color: '#5F28A5' }}>
            Hookik
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/campaigns" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Campaigns
            </Link>
            <Link href="/subscriptions" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Pricing
            </Link>
            <Link href="/earnings" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Earnings
            </Link>
            <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Leaderboard
            </Link>
            <Link href="/admin/campaigns" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Admin
            </Link>
            <Link href="/campaigns/create" className="btn-primary text-sm">
              Create Campaign
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: '#F6F7F9' }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
