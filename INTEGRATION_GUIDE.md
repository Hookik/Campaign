# Hookik Platform Upgrade — Integration Guide

## Paid Campaigns + Creator Subscription Paywall

This module adds two features to the existing Hookik platform:
1. **Paid Campaigns** — brands create paid collaborations, creators apply/execute/get paid
2. **Creator Subscriptions** — Free/Pro/Pro+ tiers gating premium features

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your MySQL credentials and Paystack keys

# Frontend
cp frontend/.env.example frontend/.env.local
```

### 3. Run Database Migrations

```bash
cd backend
npm run migrate          # Run migrations only
npm run migrate:seed     # Run migrations + seed data (plans, features, flags)
```

### 4. Start Development Servers

```bash
# Backend (standalone)
cd backend && npm run dev    # http://localhost:3001

# Frontend (Next.js)
cd frontend && npm run dev   # http://localhost:3000
```

---

## Integration with Existing Hookik Codebase

This module is designed as an **additive layer** that mounts onto your existing Express app.

### Express Integration

In your existing `server.js` or `app.js`:

```javascript
// Import the upgrade module router
const upgradeRoutes = require('./path-to/hookik-campaign/backend/src/app');

// Mount it (AFTER your existing routes and auth middleware)
app.use(upgradeRoutes);
```

### Database Integration

The migrations add **13 new tables** and **2 additive columns** to the `creators` table. No existing tables are modified or dropped.

Run migrations against your existing database:
```bash
DB_HOST=your-host DB_NAME=hookik node backend/src/database/migrate.js --seed
```

### Authentication Integration

Edit `backend/src/middleware/authMiddleware.js` to use your existing JWT verification logic. The middleware expects `req.user` to contain:
```javascript
req.user = {
  id: 'creator-or-user-uuid',
  email: 'user@example.com',
  role: 'creator' | 'business' | 'admin',
  businessId: 'business-uuid'  // for business users
};
```

### Wallet/Payout Integration

Edit `backend/src/modules/campaigns/services/CampaignPayoutService.js` — the `process()` method has a marked integration point where you replace the placeholder with your actual `wallet.credit()` call.

### Paystack Integration

The subscription billing uses your existing Paystack integration. You need to:
1. Create plans in Paystack dashboard (monthly + annual for Pro and Pro+)
2. Add the Paystack plan codes to the `subscription_plans.metadata` column
3. Set up webhook URL: `POST /api/webhooks/paystack`

---

## Architecture

```
backend/
├── src/
│   ├── app.js                      # Express router (mount point)
│   ├── config/
│   │   ├── database.js             # MySQL pool
│   │   └── paystack.js             # Paystack client
│   ├── database/
│   │   ├── migrations/             # 5 SQL migration files
│   │   ├── seeders/                # Seed data (plans, features, flags)
│   │   └── migrate.js              # Migration runner
│   ├── middleware/
│   │   ├── authMiddleware.js       # Auth (replace with yours)
│   │   └── errorHandler.js         # Global error handler
│   ├── modules/
│   │   ├── campaigns/
│   │   │   ├── controllers/        # Brand, Creator, Admin controllers
│   │   │   ├── services/           # Campaign, Application, Deliverable, Payout
│   │   │   ├── validators/         # Request validation
│   │   │   └── routes/             # Express routes
│   │   ├── subscriptions/
│   │   │   ├── controllers/        # Creator + Admin controllers
│   │   │   ├── services/           # Subscription, Billing
│   │   │   └── routes/             # Subscription + Admin routes
│   │   ├── entitlements/
│   │   │   ├── EntitlementService.js    # "Can this user do X?"
│   │   │   ├── EntitlementGuard.js      # Express middleware
│   │   │   └── FeatureFlagService.js    # Global toggles
│   │   └── audit/
│   │       └── AuditService.js     # Action logging
│   └── utils/                      # UUID, slugify, ApiError

frontend/
├── src/
│   ├── app/                        # Next.js pages
│   │   ├── campaigns/              # Browse, detail, create
│   │   ├── subscriptions/          # Pricing/upgrade page
│   │   └── admin/                  # Campaigns, subscriptions, flags, audit
│   ├── components/
│   │   ├── campaigns/              # CampaignCard, Browse, Detail, CreateForm
│   │   ├── subscriptions/          # PricingPlans
│   │   └── shared/                 # UpgradeGate, StatusBadge
│   ├── hooks/                      # useEntitlements, useSubscription
│   ├── services/                   # API client wrappers
│   ├── lib/                        # Base API client
│   └── types/                      # TypeScript definitions
```

---

## API Routes

### Brand (Business) Routes — `/api/campaigns`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/campaigns` | Create campaign |
| GET | `/api/campaigns/mine` | List my campaigns |
| GET | `/api/campaigns/:id` | Get campaign detail |
| PUT | `/api/campaigns/:id` | Update campaign |
| POST | `/api/campaigns/:id/publish` | Publish draft |
| POST | `/api/campaigns/:id/transition` | Change status |
| GET | `/api/campaigns/:id/applications` | List applicants |
| PUT | `/api/campaigns/applications/:id/status` | Accept/reject |
| POST | `/api/campaigns/submissions/:id/review` | Review deliverable |
| POST | `/api/campaigns/:id/applications/:appId/payout` | Create payout |

### Creator Routes — `/api/creator`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/creator/campaigns` | Browse campaigns |
| GET | `/api/creator/campaigns/:id` | View campaign |
| POST | `/api/creator/campaigns/:id/apply` | Apply |
| GET | `/api/creator/applications` | My applications |
| POST | `/api/creator/applications/:id/withdraw` | Withdraw |
| POST | `/api/creator/applications/:appId/deliverables/:delId/submit` | Submit work |
| GET | `/api/creator/earnings` | Earnings dashboard |
| GET | `/api/creator/entitlements` | All entitlements |
| GET | `/api/creator/entitlements/:featureKey` | Check specific |

### Subscription Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/creator/plans` | List plans (public) |
| GET | `/api/creator/subscription` | Current subscription |
| POST | `/api/creator/subscription` | Subscribe |
| POST | `/api/creator/subscription/verify` | Verify payment |
| DELETE | `/api/creator/subscription` | Cancel |
| POST | `/api/webhooks/paystack` | Paystack webhook |

### Admin Routes — `/api/admin`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/campaigns` | All campaigns |
| GET | `/api/admin/campaigns/stats` | Campaign stats |
| POST | `/api/admin/campaigns/:id/moderate` | Moderate |
| GET | `/api/admin/subscriptions` | All subscriptions |
| GET | `/api/admin/subscriptions/stats` | Sub stats |
| POST | `/api/admin/subscriptions/comp` | Comp a creator |
| GET | `/api/admin/flags` | Feature flags |
| PUT | `/api/admin/flags/:key` | Toggle flag |
| POST | `/api/admin/payouts/:id/approve` | Approve payout |
| POST | `/api/admin/payouts/:id/process` | Process payout |
| GET | `/api/admin/audit` | Audit log |

---

## Subscription Tiers

| Feature | Free | Pro (₦4,500/mo) | Pro+ (₦12,000/mo) |
|---------|------|------------------|---------------------|
| Affiliate marketplace | ✅ | ✅ | ✅ |
| Basic storefront | ✅ | ✅ | ✅ |
| Basic analytics | ✅ | ✅ | ✅ |
| Paid campaigns | ❌ | ✅ | ✅ |
| Premium analytics | ❌ | ✅ | ✅ (Advanced) |
| Verified badge | ❌ | ✅ | ✅ |
| Campaign visibility | Limited (3) | Full | Full |
| Priority placement | ❌ | ✅ | ✅ (Featured) |
| Elite campaigns | ❌ | ❌ | ✅ |
| Priority support | ❌ | ❌ | ✅ |

---

## Feature Flags

All new features are behind flags (disabled by default). Enable via Admin → Feature Flags:

| Flag | Controls |
|------|----------|
| `paid_campaigns` | Campaign module visibility |
| `creator_subscriptions` | Subscription system |
| `premium_analytics` | Analytics dashboard |
| `campaign_commission_hybrid` | Fee + commission mode |

---

## Rollout Strategy

**Phase 1:** Enable `creator_subscriptions` → test upgrade flow with internal users
**Phase 2:** Enable `paid_campaigns` → onboard 5 pilot brands
**Phase 3:** Enable `premium_analytics` + `campaign_commission_hybrid`
**Phase 4:** Open to all users, monitor metrics

Each phase can be independently rolled back by toggling the flag.
