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
- **Portability**: No Replit-specific dependencies — runs on any Node.js host (Render, Railway, Fly.io, VPS, etc.)

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
- `/portal` — Client portal (login/register + 4 tabs: Support Tickets, My Quotes, Billing, My Account)
- `/blog` — Blog listing page
- `/blog/:slug` — Individual blog post view
- `/proposal/:number` — Customer-facing proposal view with accept/reject
- `/admin` — Full CMS admin panel (21 tabs incl. Reporting, Invoices)

**Features:**
- AI chat assistant (bottom-right, powered by GPT-5.2 via OpenAI AI integration, streaming SSE, conversation history persisted to DB)
- Client authentication (register/login/JWT)
- Support ticket system (create, list, view)
- Contact form submission
- Quote request form
- Blog/news system with CMS
- Proposal/quoting system with digital signatures
- Full admin panel with dashboard, blog, services, testimonials, team, FAQ, contacts, quotes, tickets, proposals, users, activity log management
- All data persisted to PostgreSQL

### `artifacts/partner-portal` — Partner Portal (Salesforce Lightning Design)
Reseller/MSP partner portal at `/partners/` base path. Fully redesigned with Salesforce Lightning design system.

**Design System:**
- Salesforce Lightning color palette: Primary `#0176d3`, Dark `#032d60`, Success `#2e844a`, Warning `#fe9339`, Error `#ea001e`, Gray `#706e6b`
- Top navigation bar (44px, gradient `#032d60` → `#0176d3`) with tab-based navigation
- CSS utility classes: `sf-header`, `sf-page-header`, `sf-card`, `sf-card-header`, `sf-table`, `sf-badge-{success,warning,error,info,default}`, `sf-btn`, `sf-btn-primary`, `sf-btn-neutral`, `sf-input`
- 0.25rem border radius (tight enterprise style)
- Inter font family
- Accessible modals with `role="dialog"`, `aria-modal`, `aria-label`, ESC key support
- Responsive tables with `overflow-x-auto`

**Pages:**
- `/` — Public landing page
- `/login` — Partner login
- `/register` — Partner registration
- `/dashboard` — Salesforce-style home with KPI cards, revenue pipeline chart, deals by stage pie chart, recent deals table, quick actions
- `/deals` — Deal registration with list/kanban toggle, search, filters (stages: prospect, qualification, proposal, negotiation, closed_won, closed_lost)
- `/leads` — Lead management with search, inline status updates
- `/commissions` — Commission KPI cards (total, paid, approved, pending) + monthly earnings bar chart + transaction table with status/type filters + dispute commission workflow
- `/documents` — Document management: download admin-shared docs, upload/delete own partner docs
- `/resources` — Resource library with category filter tabs + search
- `/training` — Training courses with progress bars, summary cards
- `/support` — Support cases with create/view/message modals, priority/status badges
- `/announcements` — Company news with pinned/regular announcement cards
- `/profile` — Company profile with business info, contact, account status sections

### `artifacts/api-server` — Express API Server
Backend for both websites.

**Route Files:**
- `src/routes/auth.ts` — Client auth (register, login, me)
- `src/routes/cms.ts` — Blog CRUD, user management, dashboard stats, CSV export, activity log, status updates
- `src/routes/quotes.ts` — Proposals CRUD with line items, public view, accept/reject workflow
- `src/routes/partners.ts` — Partner auth, deals, leads, commissions (per-partner rate, dispute flow, CSV export, notes), support tickets, dashboard, admin management, automatic tier promotion by revenue
- `src/routes/documents.ts` — Document library: admin uploads/manages docs; partners can download shared + upload/delete their own; base64 storage, 10MB limit
- `src/lib/email.ts` — Nodemailer email service with HTML-escaped templates, graceful degradation when SMTP unconfigured
- `src/middlewares/auth.ts` — `requireAuth` (any logged-in user) + `requireAdmin` (admin role check)
- `src/routes/tickets.ts` — Client support tickets
- `src/routes/chat.ts` — Live chat messages

**Auth:**
- Admin: `siebert_token` (localStorage) — JWT with userId + role
- Partner: `partner_token` (localStorage) — JWT with partnerId
- Admin credentials: `admin@siebertrservices.com` / `Errnmgxczs1!`
- **Auth options**: Email/password, Microsoft SSO (`/api/auth/sso/microsoft?type=partner|client`), Replit OIDC (`/api/auth/replit?type=partner|client`)
- **Replit Auth**: PKCE OIDC flow via `openid-client`. Partner login links by email (must have existing account). Client login auto-creates accounts. Both issue JWT redirected via `?sso_token=`.
- **DB columns**: `users.replit_user_id`, `partners.replit_user_id` for account linking

**Email Notifications:**
- Uses Nodemailer with SMTP (env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `NOTIFICATION_EMAIL`)
- Sends on: partner deal submission (admin + partner), partner ticket submission (admin + partner)
- Gracefully degrades to console logging when SMTP not configured
- All template interpolations HTML-escaped to prevent injection

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
- `partner_commissions` — Commission tracking (status enum: pending/approved/paid/disputed/rejected; per-partner rate, notes, dispute workflow, `tsd_discrepancy` for TSD reconciliation mismatches)
- `tsd_configs` — TSD provider settings (avant/telarus/intelisys; enabled flag, AES-256-GCM encrypted `credential_ref` and `webhook_secret`, sync timestamps)
- `tsd_sync_logs` — Audit log for all TSD sync operations (direction, entity type, status, records affected)
- `tsd_deal_mappings` — Maps local deal IDs to TSD external IDs per-provider (used for commission reconciliation)
- `tsd_products` — Product and service catalog (category, name, description, available_at JSON array of TSDs, active flag, sort_order). Seeded with 56 items across 9 categories (UCaaS, CCaaS, Network Connectivity, SD-WAN, SASE/Security, Cloud Infrastructure, Managed Services, IoT/M2M, Collaboration)

## Partner Tier Automation

Partners are automatically promoted based on **YTD (Year-To-Date) Revenue**:
- **Silver**: $100,000
- **Gold**: $250,000
- **Platinum**: $500,000

**How it works:**
1. When a deal is marked as "won", YTD revenue is updated
2. Tier promotion logic runs automatically to check if threshold is crossed
3. Partner tier updates silently; can be checked via admin endpoints
4. Admin can manually trigger tier checks: `POST /api/admin/partners/promote/check`
5. View thresholds: `GET /api/admin/tier-thresholds`
6. Manual tier override: `PUT /api/admin/partners/:id/tier` (admin only)

**Code:**
- Helper function: `promotePartnerByRevenue(partnerId)` in `src/routes/partners.ts`
- Called automatically after deal closure
- No downtime or scheduled jobs needed

## TSD Integration (Avant / Telarus / Intelisys)

Two-way integration with Technology Solution Distributors.

**Key Files:**
- `lib/integrations-tsd/` — Provider adapters (AvantAdapter, TelarusAdapter, IntelisysAdapter), factory, types, utils
- `artifacts/api-server/src/lib/tsdSync.ts` — Core sync logic: deal push, lead/commission pull, scheduler
- `artifacts/api-server/src/lib/tsdSecrets.ts` — AES-256-GCM encryption for DB-stored credentials
- `artifacts/api-server/src/routes/tsd.ts` — Admin API routes
- `artifacts/api-server/src/routes/webhooks.ts` — Inbound webhook handling

**Required Environment Variables:**
- `TSD_SECRETS_KEY` — 64-char hex (32-byte) key for AES-256-GCM encryption of DB-stored secrets (**required**, auto-generated)
- `AVANT_API_KEY` — Avant API key (optional; can be entered via admin UI instead)
- `TELARUS_API_KEY` + `TELARUS_AGENT_ID` — Telarus credentials
- `INTELISYS_API_KEY` + `INTELISYS_PARTNER_ID` — Intelisys credentials
- `AVANT_WEBHOOK_SECRET` / `TELARUS_WEBHOOK_SECRET` / `INTELISYS_WEBHOOK_SECRET` — Webhook HMAC secrets (optional; overrides DB values)
- `TSD_LEAD_SYNC_INTERVAL_MINUTES` — Lead sync interval (default: 15)
- `TSD_COMMISSION_SYNC_INTERVAL_MINUTES` — Commission sync interval (default: 60)

**Credential Precedence:** env var → encrypted DB value. Env vars always take priority.

**Admin API:**
- `GET /api/admin/tsd/configs` — List provider configs
- `PUT /api/admin/tsd/configs/:provider` — Enable/disable, update credentials (encrypted before DB storage)
- `POST /api/admin/tsd/configs/:provider/test` — Test connectivity
- `POST /api/admin/tsd/sync/:provider/leads` — Trigger lead sync (provider or "all")
- `POST /api/admin/tsd/sync/:provider/commissions` — Trigger commission sync
- `GET /api/admin/tsd/logs` — Sync history
- `GET /api/admin/tsd-products` — List all catalog items (admin)
- `POST /api/admin/tsd-products` — Create catalog item
- `PUT /api/admin/tsd-products/:id` — Update catalog item
- `DELETE /api/admin/tsd-products/:id` — Delete catalog item

**Partner API:**
- `GET /api/partner/tsd-products` — Returns active catalog items grouped by category (`{ products, grouped }`)

**Product Catalog (Deal Form):**
- The deal registration form's "Products of Interest" replaces hardcoded checkboxes with a categorized, searchable product/service selector loaded from the API.
- Multi-select across categories, search input, expandable category sections.
- Legacy deal records with old product strings continue to display correctly (stored as JSON string array).
- Admins manage the catalog from the TSD Integrations tab with toggle-active, edit, add, and delete controls.
- Each product stores `available_at` (JSON array of TSDs) to support Task #7 routing resolver.

**Webhook Endpoints:**
- `POST /api/webhooks/tsd/:provider` — Receives deal updates, lead assignments, commission confirmations (HMAC verified using raw body)

**Commission Reconciliation:**
- Deal push records external ID → `tsd_deal_mappings`
- Commission sync cross-references by external ID → writes `tsd_discrepancy` field when amounts/statuses differ

## Database Schema (continued)

- `partner_support_tickets` — Partner support tickets
- `partner_ticket_messages` — Ticket conversation messages

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/db run push` — Push schema changes to database

## Database Notes

- **Development DB**: `postgresql://postgres:password@helium/heliumdb?sslmode=disable` (local Replit-managed PostgreSQL)
- **Production DB**: Set `DATABASE_URL` env var to any PostgreSQL connection string for deployment
- **Schema migrations**: `pnpm --filter @workspace/db run push` uses `drizzle-kit push`. If stuck on interactive enum questions, use direct SQL via `psql $DATABASE_URL -f migration.sql` instead.
- **New tables**: When drizzle-kit push fails interactively, create tables directly with `psql "postgresql://postgres:password@helium/heliumdb" -c "CREATE TABLE IF NOT EXISTS ..."`
- **Key tables**: `invoices`, `tsd_configs`, `tsd_products`, `tsd_vendor_mappings`, `tsd_sync_logs`, `tsd_provider_sync_logs`, `tsd_deal_mappings`

## Invoice & Billing

- Admin can create/manage invoices from the **Invoices** tab in admin panel
- Clients see their invoices in the **Billing** tab of the client portal
- API endpoints: `GET/POST /api/admin/invoices`, `PATCH/DELETE /api/admin/invoices/:id`, `GET /api/invoices` (client)

## Admin Reporting

- **Reporting** tab in admin panel shows KPIs: total clients, tickets, quotes, proposals, invoice revenue
- Shows invoice status breakdown (draft/sent/viewed/paid/overdue/void)
- Shows top partners by revenue and recent proposals
- API: `GET /api/admin/reports` (admin-only)

## Client Portal Tabs

- **Support Tickets**: Create, view, reply to support tickets
- **My Quotes**: View quote requests and received proposals
- **Billing**: View all invoices issued by Siebert Services
- **My Account**: Edit profile (name, company, phone); view member info; sign out
