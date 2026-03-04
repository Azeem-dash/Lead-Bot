<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Polar-Billing-7C3AED?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwind-css" />
</div>

<br />

<div align="center">
  <h1>🤖 myleadbots.com</h1>
  <p><strong>AI-Powered B2B Lead Generation SaaS</strong></p>
  <p>Find local businesses → Generate live AI website demos → Auto-deploy to Vercel → Outreach via Gmail</p>
</div>

---

## ✨ What It Does

**myleadbots** is a full-stack SaaS that automates the entire B2B outreach pipeline:

1. **🔍 Find Leads** — Scrapes Google Places via Apify to discover local businesses (dentists, restaurants, agencies, etc.)
2. **🎨 Generate Demos** — Uses Gemini 2.0 Flash (FREE) to generate a stunning, personalized HTML website redesign for each prospect
3. **🚀 Auto-Deploy** — Deploys each site to the **user's own Vercel account** via OAuth (zero hosting cost for you)
4. **📧 Outreach** — Sends personalized emails via the **user's own Gmail** with a live link to their custom demo
5. **📊 Track** — Full CRM dashboard with lead status tracking (New → Contacted → Replied → Meeting → Closed)

> **Core Differentiator**: Competitors send plain text emails. We send a *live, deployed website* the prospect can click and share — before the first sales call.

---

## 🏗️ Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) | TypeScript, Tailwind CSS |
| **Database** | Supabase (PostgreSQL) | Row-Level Security enabled |
| **Auth** | Supabase Native Auth | Google OAuth |
| **AI (Primary)** | Gemini 2.0 Flash | 1M tokens/day FREE |
| **AI (Fallback)** | DeepSeek V3 | ~$0.27/M tokens |
| **Lead Scraping** | Apify | Google Places Actor |
| **Website Hosting** | User's own Vercel | OAuth integration |
| **Email Sending** | User's own Gmail | OAuth, 30-50/day limit |
| **Billing** | Polar | Subscriptions + credit top-ups |
| **Deployment** | Vercel | Edge-optimized |

---

## 💰 Pricing Tiers

| Plan | Price | Credits | Use Case |
|------|-------|---------|----------|
| **Free** | $0 | 50 one-time | Try the platform |
| **Pro** | $99/mo | 500/mo | Freelancers & small agencies |
| **Agency** | $299/mo | 2,000/mo | Full-scale agencies |
| **Enterprise** | Custom | Unlimited | White-label + custom API |

**Credit usage:** 1 lead scraped = 1 credit · 1 AI website = 5 credits · 1 email = 1 credit

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- [Supabase](https://supabase.com) project
- [Polar](https://polar.sh) account (for billing)
- [Google Cloud](https://console.cloud.google.com) project (for OAuth)
- [Apify](https://apify.com) account (for lead scraping)
- [Vercel](https://vercel.com) account

### 1. Clone & Install

```bash
git clone https://github.com/Azeem-dash/Lead-Bot.git
cd Lead-Bot
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local` (see [Environment Variables](#-environment-variables) section).

### 3. Set Up the Database

Run the migrations in your Supabase SQL Editor **in order**:

```bash
# 1. Initial schema
supabase/migrations/20260303_initial_schema.sql

# 2. Billing columns
supabase/migrations/20260304_billing_columns.sql
```

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add to **Authorized redirect URIs**: `https://<your-project>.supabase.co/auth/v1/callback`
4. Copy the Client ID & Secret into your Supabase Dashboard → Authentication → Providers → Google

### 5. Configure Polar Billing

1. Create products in your [Polar dashboard](https://polar.sh) (Pro $99/mo, Agency $299/mo)
2. Copy your Access Token and Product IDs into `.env.local`
3. For production, add a webhook endpoint in Polar: `https://yourdomain.com/api/polar/webhook`

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔑 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Google OAuth (configured in Supabase Dashboard)
# No client ID/secret needed here — handled by Supabase

# Polar (Billing)
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_PRO_PRODUCT_ID=
POLAR_AGENCY_PRODUCT_ID=

# AI Models
GEMINI_API_KEY=
DEEPSEEK_API_KEY=

# Apify (Lead Scraping)
APIFY_API_TOKEN=

# Vercel OAuth (User connects their Vercel)
VERCEL_CLIENT_ID=
VERCEL_CLIENT_SECRET=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/           # Landing, pricing pages
│   │   ├── page.tsx        # Homepage
│   │   └── pricing/        # Pricing page
│   ├── dashboard/          # Protected dashboard
│   │   ├── layout.tsx      # Sidebar + header
│   │   ├── page.tsx        # Dashboard overview
│   │   ├── campaigns/      # Campaign management
│   │   ├── billing/        # Subscription management
│   │   └── settings/       # User settings
│   ├── api/
│   │   ├── polar/
│   │   │   ├── checkout/   # Polar checkout redirect
│   │   │   └── webhook/    # Polar webhook handler
│   │   └── auth/
│   │       └── callback/   # Supabase OAuth callback
│   ├── login/              # Login page
│   └── globals.css
├── components/
│   ├── Navbar.tsx          # Auth-aware navigation
│   └── StatCard.tsx        # Reusable stats card
├── utils/
│   └── supabase/
│       ├── client.ts       # Browser Supabase client
│       ├── server.ts       # Server Supabase client
│       └── middleware.ts   # Session refresh middleware
└── middleware.ts           # Route protection
supabase/
└── migrations/             # SQL migrations
```

---

## 🗺️ Roadmap

- [x] Authentication (Supabase Google OAuth)
- [x] Premium dark-mode dashboard UI
- [x] Database schema (users, campaigns, leads, credits)
- [x] Billing system (Polar subscriptions)
- [x] Public pricing page
- [ ] Apify lead scraping integration
- [ ] Gemini AI website generation
- [ ] Vercel OAuth deployment
- [ ] Gmail OAuth outreach
- [ ] Lead status CRM tracking
- [ ] Campaign analytics dashboard
- [ ] Vercel deployment

---

## 🧑‍💻 Contributing

This is a private SaaS project. Issues and PRs are welcome from collaborators.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Azeem-dash">Azeem</a></p>
  <p><strong>myleadbots.com</strong> — Show, Don't Tell. AI Website Demos That Close Deals.</p>
</div>
