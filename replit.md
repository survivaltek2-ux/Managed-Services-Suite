# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: bcryptjs + jsonwebtoken (JWT, 7-day expiry)

## Artifacts

### `artifacts/siebert-services` — Siebert Services MSP Website
Full-featured MSP/Reseller marketing + client portal website for **Siebert Repair Services LLC DBA Siebert Services**.

**Pages:**
- `/` — Home (hero, services overview, Zoom partner highlight, stats, testimonials)
- `/services` — Full services breakdown
- `/zoom` — Dedicated Zoom Partner page (all Zoom products)
- `/about` — About Us
- `/contact` — Contact form
- `/quote` — Multi-step quote request form
- `/portal` — Client portal (login/register + ticket dashboard)
- `/blog` — Blog listing page
- `/blog/:slug` — Individual blog post view
- `/proposal/:number` — Customer-facing proposal view with accept/reject
- `/admin` — Full CMS admin panel (13 tabs)

**Features:**
- Live chat widget (bottom-right, session-based)
- Client authentication (register/login/JWT)
- Support ticket system (create, list, view)
- Contact form submission
- Quote request form
- Blog/news system with CMS
- Proposal/quoting system with digital signatures
- Full admin panel with dashboard, blog, services, testimonials, team, FAQ, contacts, quotes, tickets, proposals, users, activity log management
- All data persisted to PostgreSQL

### `artifacts/partner-portal` — Partner Portal (Salesforce-style)
Reseller/MSP partner portal at `/partners/` base path.

**Pages:**
- `/` — Public landing page
- `/login` — Partner login
- `/register` — Partner registration
- `/dashboard` — Overview with metrics, charts, quick links
- `/deals` — Deal registration and tracking
- `/leads` — Lead management
- `/commissions` — Commission tracking and payment history
- `/resources` — Partner resources library
- `/training` — Training & certifications
- `/support` — Support ticket system with messaging
- `/mdf` — Market Development Fund requests
- `/announcements` — Company announcements
- `/profile` — Partner profile management

### `artifacts/api-server` — Express API Server
Backend for both websites.

**Route Files:**
- `src/routes/auth.ts` — Client auth (register, login, me)
- `src/routes/cms.ts` — Blog CRUD, user management, dashboard stats, CSV export, activity log, status updates
- `src/routes/quotes.ts` — Proposals CRUD with line items, public view, accept/reject workflow
- `src/routes/partners.ts` — Partner auth, deals, leads, commissions, support tickets, MDF requests, dashboard, admin management
- `src/routes/tickets.ts` — Client support tickets
- `src/routes/chat.ts` — Live chat messages

**Auth:**
- Admin: `siebert_token` (localStorage) — JWT with userId + role
- Partner: `partner_token` (localStorage) — JWT with partnerId
- Admin credentials: `admin@siebertservices.com` / `SiebertAdmin2024!`

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   ├── siebert-services/   # React + Vite MSP website
│   └── partner-portal/     # React + Vite partner portal
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- `users` — Client accounts (name, email, password hash, company, phone, role)
- `contacts` — Contact form submissions
- `quotes` — Quote requests
- `tickets` — Support tickets (linked to users)
- `chat_messages` — Live chat messages (session-based)
- `blog_posts` — Blog/news articles (title, slug, content, author, category, tags, featured, status)
- `activity_log` — CMS activity tracking
- `quote_proposals` — Formal proposals with line items and digital signatures
- `quote_line_items` — Individual items on proposals
- `settings` — Key-value site settings
- `services` — Service offerings
- `testimonials` — Customer testimonials
- `team_members` — Team member profiles
- `faqs` — FAQ entries
- `partners` — Partner accounts
- `partner_deals` — Deal registrations
- `partner_leads` — Assigned leads
- `partner_resources` — Resource library
- `partner_certifications` — Available certifications
- `partner_cert_progress` — Partner certification progress
- `partner_announcements` — Company announcements
- `partner_commissions` — Commission tracking
- `partner_support_tickets` — Partner support tickets
- `partner_ticket_messages` — Ticket conversation messages
- `partner_mdf_requests` — Market Development Fund requests

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/db run push` — Push schema changes to database
