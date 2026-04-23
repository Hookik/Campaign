/**
 * Hookik Demo Data
 * Realistic Nigerian creator economy data for UI development and testing.
 * Every name, brand, niche, and price reflects the Nigerian market.
 */

// ─── Avatar & Image Helpers ───
const avatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200&bold=true`;
const brandLogo = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5F28A5&color=fff&size=200&rounded=true&bold=true`;
const productImg = (id: number) => `https://picsum.photos/seed/hookik-product-${id}/400/400`;
const campaignCover = (id: number) => `https://picsum.photos/seed/hookik-campaign-${id}/800/400`;

// ─── Nigerian Brands ───
export const DEMO_BRANDS = [
  {
    id: 'biz00000-0000-0000-0000-000000000001',
    name: 'Glow By Amara',
    logo: brandLogo('Glow Amara'),
    industry: 'Beauty & Skincare',
    location: 'Lagos, Nigeria',
    website: 'https://glowbyamara.com',
    description: 'Premium Nigerian skincare made with local ingredients like shea butter, black soap, and turmeric.',
    verified: true,
    campaignCount: 12,
  },
  {
    id: 'biz00000-0000-0000-0000-000000000002',
    name: 'Naija Drip',
    logo: brandLogo('Naija Drip'),
    industry: 'Fashion & Streetwear',
    location: 'Lagos, Nigeria',
    website: 'https://naijadrip.ng',
    description: 'Contemporary Afrocentric streetwear for the bold and unapologetic.',
    verified: true,
    campaignCount: 8,
  },
  {
    id: 'biz00000-0000-0000-0000-000000000003',
    name: 'ChopBar NG',
    logo: brandLogo('ChopBar'),
    industry: 'Food & Beverage',
    location: 'Abuja, Nigeria',
    website: 'https://chopbar.ng',
    description: 'Modern Nigerian cuisine delivered to your door. From jollof to suya, we do it right.',
    verified: false,
    campaignCount: 3,
  },
  {
    id: 'biz00000-0000-0000-0000-000000000004',
    name: 'FitFam Lagos',
    logo: brandLogo('FitFam'),
    industry: 'Health & Fitness',
    location: 'Lagos, Nigeria',
    website: 'https://fitfamlagos.com',
    description: 'Nigeria\'s #1 fitness supplements and workout gear brand.',
    verified: true,
    campaignCount: 6,
  },
  {
    id: 'biz00000-0000-0000-0000-000000000005',
    name: 'TechVille',
    logo: brandLogo('TechVille'),
    industry: 'Tech & Gadgets',
    location: 'Port Harcourt, Nigeria',
    website: 'https://techville.ng',
    description: 'Affordable tech accessories and gadgets for the everyday Nigerian.',
    verified: true,
    campaignCount: 5,
  },
];

// ─── Nigerian Creators ───
export const DEMO_CREATORS = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Chioma Okafor',
    handle: '@chioma.beauty',
    avatar: avatar('Chioma Okafor'),
    niche: 'Beauty & Skincare',
    platform: 'Instagram',
    followers: 85_000,
    engagement: 4.8,
    location: 'Lagos',
    tier: 'pro_plus',
    verified: true,
    rating: 4.9,
    campaignsCompleted: 24,
    totalEarned: 2_850_000,
    bio: 'Skincare enthusiast 🧴 | Honest reviews | Your melanin deserves the best ✨',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Emeka Adeyemi',
    handle: '@emeka.eats',
    avatar: avatar('Emeka Adeyemi'),
    niche: 'Food & Lifestyle',
    platform: 'TikTok',
    followers: 120_000,
    engagement: 6.2,
    location: 'Abuja',
    tier: 'pro',
    verified: true,
    rating: 4.7,
    campaignsCompleted: 18,
    totalEarned: 1_920_000,
    bio: 'I find the best food in Nigeria so you don\'t have to 🍗 | Food tours | Restaurant reviews',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Aisha Mohammed',
    handle: '@aisha.fits',
    avatar: avatar('Aisha Mohammed'),
    niche: 'Fashion',
    platform: 'Instagram',
    followers: 45_000,
    engagement: 5.1,
    location: 'Kano',
    tier: 'pro',
    verified: true,
    rating: 4.8,
    campaignsCompleted: 15,
    totalEarned: 1_350_000,
    bio: 'Modest fashion with a twist 🧕 | Styling tips | Thrift finds | Abaya looks',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    name: 'Tunde Bakare',
    handle: '@tunde.tech',
    avatar: avatar('Tunde Bakare'),
    niche: 'Tech & Reviews',
    platform: 'YouTube',
    followers: 210_000,
    engagement: 3.9,
    location: 'Lagos',
    tier: 'pro_plus',
    verified: true,
    rating: 4.6,
    campaignsCompleted: 31,
    totalEarned: 4_200_000,
    bio: 'Tech reviewer 📱 | Gadget unboxings | "Is it worth it?" series | Nigeria\'s tech voice',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    name: 'Blessing Nwachukwu',
    handle: '@blessingfit',
    avatar: avatar('Blessing Nwachukwu'),
    niche: 'Fitness & Wellness',
    platform: 'Instagram',
    followers: 32_000,
    engagement: 7.3,
    location: 'Port Harcourt',
    tier: 'free',
    verified: false,
    rating: 4.5,
    campaignsCompleted: 6,
    totalEarned: 480_000,
    bio: 'Fitness coach 💪 | Home workouts | Nigerian healthy meals | No gym? No wahala!',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    name: 'Kelechi Uzo',
    handle: '@kelechi.lifestyle',
    avatar: avatar('Kelechi Uzo'),
    niche: 'Lifestyle',
    platform: 'TikTok',
    followers: 68_000,
    engagement: 5.5,
    location: 'Enugu',
    tier: 'pro',
    verified: true,
    rating: 4.7,
    campaignsCompleted: 12,
    totalEarned: 1_100_000,
    bio: 'Living my best life in Nigeria 🇳🇬 | Travel | Home decor | Day-in-my-life vlogs',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000007',
    name: 'Funke Adebayo',
    handle: '@funke.mom',
    avatar: avatar('Funke Adebayo'),
    niche: 'Parenting & Family',
    platform: 'Instagram',
    followers: 52_000,
    engagement: 6.8,
    location: 'Ibadan',
    tier: 'pro',
    verified: true,
    rating: 4.9,
    campaignsCompleted: 9,
    totalEarned: 780_000,
    bio: 'Mom of 3 🤱 | Nigerian parenting tips | Baby product reviews | "Mama knows best"',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000008',
    name: 'Dayo Ogunleye',
    handle: '@dayo.vlogs',
    avatar: avatar('Dayo Ogunleye'),
    niche: 'Comedy & Entertainment',
    platform: 'TikTok',
    followers: 340_000,
    engagement: 8.1,
    location: 'Lagos',
    tier: 'pro_plus',
    verified: true,
    rating: 4.4,
    campaignsCompleted: 22,
    totalEarned: 3_600_000,
    bio: 'Making Nigeria laugh one skit at a time 😂 | Brand collabs | MC for hire',
  },
];

// ─── Products (Glow By Amara) ───
export const DEMO_PRODUCTS = [
  { id: 'prod0000-0000-0000-0000-000000000001', name: 'Glow Serum SPF30', description: 'Lightweight daily serum with SPF protection and vitamin C', price: 12_500, currency: 'NGN', image_url: productImg(1), business_id: 'biz00000-0000-0000-0000-000000000001' },
  { id: 'prod0000-0000-0000-0000-000000000002', name: 'Hydrating Face Mist', description: 'Refreshing rose water mist for all skin types', price: 7_500, currency: 'NGN', image_url: productImg(2), business_id: 'biz00000-0000-0000-0000-000000000001' },
  { id: 'prod0000-0000-0000-0000-000000000003', name: 'Night Repair Cream', description: 'Rich overnight moisturizer with retinol and shea butter', price: 18_000, currency: 'NGN', image_url: productImg(3), business_id: 'biz00000-0000-0000-0000-000000000001' },
  { id: 'prod0000-0000-0000-0000-000000000004', name: 'Vitamin C Cleanser', description: 'Gentle foaming cleanser with brightening vitamin C', price: 9_500, currency: 'NGN', image_url: productImg(4), business_id: 'biz00000-0000-0000-0000-000000000001' },
  { id: 'prod0000-0000-0000-0000-000000000005', name: 'Lip Gloss Collection', description: 'Set of 4 shimmering lip glosses in seasonal shades', price: 15_000, currency: 'NGN', image_url: productImg(5), business_id: 'biz00000-0000-0000-0000-000000000001' },
];

// ─── Demo Campaigns ───
export const DEMO_CAMPAIGNS = [
  {
    id: 'camp0000-0000-0000-0000-000000000001',
    title: 'Summer Glow Collection Launch',
    brief: 'We\'re launching our new summer skincare line and need authentic creators to showcase the products to their audience. Show your morning/evening skincare routine featuring our products.',
    campaign_type: 'fee_plus_commission',
    visibility: 'public',
    status: 'published',
    budget_type: 'flat',
    fee_per_creator: 50_000,
    commission_on_top: true,
    commission_rate: 15,
    max_creators: 5,
    spots_remaining: 3,
    application_count: 12,
    cover_image_url: campaignCover(1),
    brand: DEMO_BRANDS[0],
    products: [DEMO_PRODUCTS[0], DEMO_PRODUCTS[1], DEMO_PRODUCTS[2]],
    deliverables: [
      { title: 'Instagram Reel', deliverable_type: 'instagram_post', quantity: 2, description: '30-60 second reel showing skincare routine' },
      { title: 'Story Series', deliverable_type: 'instagram_story', quantity: 3, description: 'Unboxing + first impressions + results' },
    ],
    requirements: [
      { req_type: 'niche', req_value: 'beauty', is_required: true },
      { req_type: 'follower_min', req_value: '5000', is_required: true },
      { req_type: 'location', req_value: 'Nigeria', is_required: false },
    ],
    created_at: '2026-04-15T10:00:00Z',
    published_at: '2026-04-16T08:00:00Z',
    application_deadline: '2026-05-01T23:59:00Z',
    matchScore: 92,
    tags: ['skincare', 'beauty', 'routine', 'sponsored'],
  },
  {
    id: 'camp0000-0000-0000-0000-000000000002',
    title: 'Naija Drip Street Style Campaign',
    brief: 'Show off your street style wearing Naija Drip pieces. We want raw, unfiltered Nigerian fashion content — no studio shots. Show us how you style our pieces in real Lagos, Abuja, or your city.',
    campaign_type: 'fixed_fee',
    visibility: 'public',
    status: 'published',
    budget_type: 'variable',
    fee_min: 30_000,
    fee_max: 80_000,
    fee_per_creator: null,
    commission_on_top: false,
    commission_rate: null,
    max_creators: 10,
    spots_remaining: 7,
    application_count: 5,
    cover_image_url: campaignCover(2),
    brand: DEMO_BRANDS[1],
    products: [],
    deliverables: [
      { title: 'TikTok Video', deliverable_type: 'tiktok_video', quantity: 1, description: 'GRWM or outfit transition video' },
      { title: 'Instagram Post', deliverable_type: 'instagram_post', quantity: 2, description: 'Styled outfit photos with location tag' },
    ],
    requirements: [
      { req_type: 'niche', req_value: 'fashion', is_required: true },
      { req_type: 'follower_min', req_value: '3000', is_required: true },
    ],
    created_at: '2026-04-18T14:00:00Z',
    published_at: '2026-04-19T09:00:00Z',
    application_deadline: '2026-05-10T23:59:00Z',
    matchScore: 78,
    tags: ['fashion', 'streetwear', 'afrocentric', 'style'],
  },
  {
    id: 'camp0000-0000-0000-0000-000000000003',
    title: 'ChopBar Taste Test Challenge',
    brief: 'Try our signature dishes and give your honest reaction. We want genuine "first bite" moments. Film your reaction trying our Suya Burger, Jollof Pasta, or Pepper Soup Ramen for the first time.',
    campaign_type: 'gifted',
    visibility: 'public',
    status: 'published',
    budget_type: 'flat',
    fee_per_creator: 25_000,
    commission_on_top: true,
    commission_rate: 10,
    max_creators: 15,
    spots_remaining: 11,
    application_count: 8,
    cover_image_url: campaignCover(3),
    brand: DEMO_BRANDS[2],
    products: [],
    deliverables: [
      { title: 'TikTok Taste Test', deliverable_type: 'tiktok_video', quantity: 1, description: 'First reaction tasting video' },
    ],
    requirements: [
      { req_type: 'niche', req_value: 'food', is_required: true },
      { req_type: 'platform', req_value: 'tiktok', is_required: true },
    ],
    created_at: '2026-04-20T11:00:00Z',
    published_at: '2026-04-20T15:00:00Z',
    application_deadline: '2026-05-15T23:59:00Z',
    matchScore: 65,
    tags: ['food', 'taste-test', 'reaction', 'nigerian-food'],
  },
  {
    id: 'camp0000-0000-0000-0000-000000000004',
    title: 'FitFam 30-Day Transformation',
    brief: 'Document your 30-day fitness journey using our supplements and workout plans. Share weekly updates showing your progress, meals, and honest review of our products.',
    campaign_type: 'fee_plus_commission',
    visibility: 'premium_only',
    status: 'published',
    budget_type: 'flat',
    fee_per_creator: 120_000,
    commission_on_top: true,
    commission_rate: 20,
    max_creators: 3,
    spots_remaining: 1,
    application_count: 18,
    cover_image_url: campaignCover(4),
    brand: DEMO_BRANDS[3],
    products: [],
    deliverables: [
      { title: 'Weekly Instagram Reel', deliverable_type: 'instagram_post', quantity: 4, description: 'Weekly progress update reel' },
      { title: 'YouTube Review', deliverable_type: 'youtube_video', quantity: 1, description: 'Full 30-day honest review video' },
    ],
    requirements: [
      { req_type: 'niche', req_value: 'fitness', is_required: true },
      { req_type: 'follower_min', req_value: '10000', is_required: true },
    ],
    created_at: '2026-04-10T09:00:00Z',
    published_at: '2026-04-11T07:00:00Z',
    application_deadline: '2026-04-30T23:59:00Z',
    matchScore: 45,
    tags: ['fitness', 'transformation', 'supplements', 'wellness'],
    require_pro: true,
  },
  {
    id: 'camp0000-0000-0000-0000-000000000005',
    title: 'TechVille Gadget Review Series',
    brief: 'Review our latest affordable tech accessories — wireless earbuds, phone cases, ring lights, and more. Show how these budget-friendly gadgets fit into the everyday Nigerian tech user\'s life.',
    campaign_type: 'fixed_fee',
    visibility: 'public',
    status: 'published',
    budget_type: 'flat',
    fee_per_creator: 35_000,
    commission_on_top: false,
    commission_rate: null,
    max_creators: 8,
    spots_remaining: 5,
    application_count: 14,
    cover_image_url: campaignCover(5),
    brand: DEMO_BRANDS[4],
    products: [],
    deliverables: [
      { title: 'Unboxing Video', deliverable_type: 'youtube_video', quantity: 1, description: 'Unboxing + first impressions' },
      { title: 'Review Post', deliverable_type: 'instagram_post', quantity: 1, description: 'In-depth review with pros/cons' },
    ],
    requirements: [
      { req_type: 'niche', req_value: 'tech', is_required: true },
      { req_type: 'follower_min', req_value: '5000', is_required: true },
    ],
    created_at: '2026-04-17T13:00:00Z',
    published_at: '2026-04-18T10:00:00Z',
    application_deadline: '2026-05-05T23:59:00Z',
    matchScore: 71,
    tags: ['tech', 'gadgets', 'reviews', 'affordable'],
  },
  {
    id: 'camp0000-0000-0000-0000-000000000006',
    title: 'Glow By Amara x Detty December',
    brief: 'Get party-ready with our holiday glam collection. Create a "Get Ready With Me" for owambe season — show your makeup routine, skincare prep, and final look heading out for December events.',
    campaign_type: 'fee_plus_commission',
    visibility: 'public',
    status: 'completed',
    budget_type: 'flat',
    fee_per_creator: 75_000,
    commission_on_top: true,
    commission_rate: 12,
    max_creators: 6,
    spots_remaining: 0,
    application_count: 42,
    cover_image_url: campaignCover(6),
    brand: DEMO_BRANDS[0],
    products: [DEMO_PRODUCTS[0], DEMO_PRODUCTS[4]],
    deliverables: [
      { title: 'GRWM Reel', deliverable_type: 'instagram_post', quantity: 1, description: 'Get Ready With Me for a party' },
      { title: 'Product Review', deliverable_type: 'instagram_story', quantity: 4, description: 'Detailed product reviews in stories' },
    ],
    requirements: [
      { req_type: 'niche', req_value: 'beauty', is_required: true },
      { req_type: 'follower_min', req_value: '10000', is_required: true },
    ],
    created_at: '2025-11-15T09:00:00Z',
    published_at: '2025-11-16T07:00:00Z',
    matchScore: 88,
    tags: ['beauty', 'detty-december', 'party', 'glam'],
  },
];

// ─── Platform Stats ───
export const PLATFORM_STATS = {
  totalCreators: 12_400,
  totalBrands: 890,
  totalCampaigns: 3_200,
  totalPaidOut: 245_000_000, // ₦245M
  avgCampaignFee: 45_000,
  avgCommissionRate: 12,
  topNiche: 'Beauty & Skincare',
  activeCountries: ['Nigeria', 'Ghana', 'Kenya'],
};

// ─── Demo Earnings Data ───
export const DEMO_EARNINGS_CHART = [
  { month: 'Nov', campaignFees: 75_000, commissions: 12_500, total: 87_500 },
  { month: 'Dec', campaignFees: 150_000, commissions: 38_200, total: 188_200 },
  { month: 'Jan', campaignFees: 50_000, commissions: 22_800, total: 72_800 },
  { month: 'Feb', campaignFees: 100_000, commissions: 31_400, total: 131_400 },
  { month: 'Mar', campaignFees: 125_000, commissions: 45_600, total: 170_600 },
  { month: 'Apr', campaignFees: 80_000, commissions: 52_300, total: 132_300 },
];

export const DEMO_PAYOUTS = [
  { id: 'pay001', campaign_title: 'Summer Glow Collection Launch', payout_type: 'campaign_fee', amount: 50_000, status: 'paid', paid_at: '2026-04-20T14:00:00Z' },
  { id: 'pay002', campaign_title: 'Summer Glow Collection Launch', payout_type: 'commission', amount: 8_750, status: 'paid', paid_at: '2026-04-21T09:00:00Z' },
  { id: 'pay003', campaign_title: 'Glow By Amara x Detty December', payout_type: 'campaign_fee', amount: 75_000, status: 'paid', paid_at: '2025-12-28T11:00:00Z' },
  { id: 'pay004', campaign_title: 'Naija Drip Street Style Campaign', payout_type: 'campaign_fee', amount: 45_000, status: 'pending', paid_at: null },
  { id: 'pay005', campaign_title: 'Summer Glow Collection Launch', payout_type: 'commission', amount: 4_200, status: 'pending', paid_at: null },
];

// ─── Testimonials ───
export const TESTIMONIALS = [
  {
    name: 'Chioma Okafor',
    handle: '@chioma.beauty',
    avatar: avatar('Chioma Okafor'),
    role: 'Creator',
    quote: 'Hookik changed the game for me. I used to chase brands for payment — now I get paid upfront AND earn commission every time someone buys through my link. Last month I made ₦285K from one campaign alone.',
    metric: '₦2.8M earned',
  },
  {
    name: 'Amara Eze',
    handle: 'Glow By Amara',
    avatar: brandLogo('Amara'),
    role: 'Brand',
    quote: 'We tried Plaqad, Instagram DMs, even agencies. Nothing worked like Hookik. We launched our summer line with 5 creators and sold out in 2 weeks. The hybrid model means creators actually care about selling — not just posting.',
    metric: '340% ROI',
  },
  {
    name: 'Tunde Bakare',
    handle: '@tunde.tech',
    avatar: avatar('Tunde Bakare'),
    role: 'Creator',
    quote: 'The affiliate commission is what keeps me here. Even months after a campaign ends, I still earn from product sales. It\'s like having a side business on autopilot. Other platforms don\'t offer this.',
    metric: '₦4.2M total earned',
  },
];

// ─── Utility Functions ───
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompact(amount: number): string {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount}`;
}

export function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

export function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function getDaysLeft(deadlineStr: string): string {
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Closed';
  if (days === 0) return 'Last day';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export function getMatchColor(score: number): string {
  if (score >= 80) return '#1B8E47';
  if (score >= 60) return '#228BE6';
  if (score >= 40) return '#F59E0B';
  return '#94A3B8';
}

export function getNicheIcon(niche: string): string {
  const icons: Record<string, string> = {
    'Beauty & Skincare': '💄',
    'Fashion': '👗',
    'Fashion & Streetwear': '👟',
    'Food & Lifestyle': '🍲',
    'Food & Beverage': '🍔',
    'Tech & Reviews': '📱',
    'Tech & Gadgets': '💻',
    'Fitness & Wellness': '💪',
    'Health & Fitness': '🏋️',
    'Lifestyle': '✨',
    'Parenting & Family': '👶',
    'Comedy & Entertainment': '😂',
    'beauty': '💄',
    'fashion': '👗',
    'food': '🍲',
    'tech': '📱',
    'fitness': '💪',
    'lifestyle': '✨',
  };
  return icons[niche] || '🎯';
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    'Instagram': '📸',
    'TikTok': '🎵',
    'YouTube': '🎬',
    'Twitter': '🐦',
    'WhatsApp': '💬',
    'instagram_post': '📸',
    'instagram_story': '📱',
    'tiktok_video': '🎵',
    'youtube_video': '🎬',
    'blog_post': '📝',
    'product_review': '⭐',
    'unboxing': '📦',
    'whatsapp_status': '💬',
  };
  return icons[platform] || '📱';
}
