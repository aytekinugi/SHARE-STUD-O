# Vanguard AI

A production-grade, mobile-first productivity RPG SaaS. Phase 2 adds onboarding, guilds, marketplace, Destiny Map, predictive AI Oracle, stricter RLS, Edge Function templates, and premium monetization polish.

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Framer Motion, Lucide React, shadcn-style UI primitives
- Supabase Auth/Postgres/RLS + Edge Function templates
- OpenAI GPT-4o quest architect and Oracle reporting
- Stripe Checkout + webhook subscription updates
- TanStack Query provider and dynamic imports for performance
- **Paylaşım merkezi** (`/share`): Instagram, WhatsApp (durum + sohbet), YouTube yükleme, Facebook Marketplace, LinkedIn ve genişletilebilir diğer ağlar — işlem tarayıcıda, kota yok

## Quick Start

```bash
cp .env.example .env.local
npm install
npm run dev
```

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Enable Google OAuth and email magic links in Supabase Auth.
4. Add variables from `.env.example`.
5. Create a Stripe recurring price for `$12/mo` and set `NEXT_PUBLIC_STRIPE_PRICE_ID`.
6. Configure Stripe webhook: `/api/stripe/webhook`. Enable events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Set `STRIPE_WEBHOOK_SECRET`. Apply the billing columns migration at the end of `supabase/schema.sql` (`stripe_customer_id`, `stripe_subscription_id`) so webhooks can map customers reliably.

7. (Production) Optionally set `SERVER_ACTIONS_ALLOWED_ORIGINS` — comma-separated hostnames allowed for Server Actions besides `localhost:3000` (see `next.config.mjs`).

## Phase 2 Features

### Ultimate Onboarding
- `/onboarding` asks 3 strategic questions.
- `/api/onboarding` uses GPT-4o to assign a character class and starter quest pack.
- Creates initial Destiny Map nodes.

### Advanced RPG/Social
- Guild system: `guilds`, `guild_members`, `guild_messages`.
- Private guild chat and weekly XP leaderboard.
- Marketplace with Vanguard Gold, skins, and 2-hour +20% XP Focus Boost.
- Destiny Map skill tree lights up as quests are completed.
- Golden Level Up burst animation via Framer Motion.

### AI Oracle Engine
- `/api/oracle/daily-report` analyzes the last 7 days and creates markdown battle reports.
- `supabase/functions/ai-oracle` provides a secure scheduled Edge Function template.

### Monetization/Security
- `/pricing` page and Pro/Legendary upgrade modal.
- Stripe Checkout and webhook included.
- RLS policies isolate profiles, quests, insights, inventory, skill nodes, and guild chat.
- `supabase/functions/stripe-verify` included for Supabase-side payment verification deployments.

## Validation

```bash
npm run typecheck
npm run lint
npm run test
npm run build   # Runs without `.env`; auth pages stay static — ensure env for live Supabase-backed routes
npx playwright install chromium   # first-time browser binaries
npm run test:e2e
```

`npm audit` may still warn on transitive toolchain packages; upgrading beyond Next **14.x** jumps major versions (`npm audit fix --force`).
