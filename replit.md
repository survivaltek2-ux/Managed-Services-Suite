# Overview

This project is a pnpm monorepo containing a comprehensive suite of web applications for **Siebert Repair Services LLC DBA Siebert Services**, an MSP/Reseller. It includes a full-featured marketing and client portal website, a dedicated partner portal, and a shared Express API server. The system is designed to manage client interactions, partner relationships, sales processes, and integrations with Technology Solution Distributors (TSDs). The architecture prioritizes portability, allowing deployment on any Node.js host.

**Key Capabilities:**
- Client-facing website with services, contact, quoting, and client portal functionalities.
- Partner portal for deal registration, lead management, commissions, and resources.
- Robust API server supporting both frontends, including authentication, CMS, and integrations.
- AI chat assistant for client support.
- Integration with major Technology Solution Distributors (Avant, Telarus, Intelisys) for lead, deal, and commission synchronization.
- Automated partner tier promotion based on revenue.
- Comprehensive admin panel for content, user, and business process management, including invoicing and reporting.

# User Preferences

I prefer iterative development.
Ask before making major changes.
I prefer to use pnpm for package management.
I want to use TypeScript for all development.
I want to ensure the application is portable and not tied to Replit-specific dependencies.
I prefer detailed explanations for complex architectural decisions.
Do not make changes to the folder `lib/api-client-react/`.
Do not make changes to the file `src/lib/email.ts` without prior discussion.

# System Architecture

## Monorepo Structure
The project uses a pnpm workspace monorepo with three main applications under `artifacts/`: `siebert-services` (client website), `partner-portal` (partner website), and `api-server` (Express backend). Shared libraries like API specifications, generated clients, Zod schemas, and Drizzle ORM configurations are located in `lib/`.

## Technology Stack
- **Backend**: Node.js 24, Express 5, PostgreSQL, Drizzle ORM, Zod.
- **Frontend**: React + Vite (for both `siebert-services` and `partner-portal`).
- **Authentication**: JWT-based (bcryptjs, jsonwebtoken), supporting email/password, Microsoft SSO, Okta SSO, and Replit OIDC.
- **Build**: esbuild for CJS bundles.
- **API Codegen**: Orval from OpenAPI specifications.

## UI/UX Decisions
- **Siebert Services Website**: Standard modern web design with a focus on clear service presentation, intuitive forms, and an accessible client portal.
- **Partner Portal**: Implements the Salesforce Lightning Design System, featuring Salesforce-inspired color palette, typography (Inter font), and component styling (e.g., `sf-card`, `sf-table`, `sf-btn`). This ensures a consistent, enterprise-grade look and feel. Components are designed for accessibility, including modals with ARIA attributes.

## Feature Specifications
- **AI Chat Assistant**: GPT-5.2 powered, streaming SSE, conversation history persisted.
- **Client Portal**: Support tickets, quote viewing, billing, account management.
- **Partner Portal**: Dashboard with KPIs, deal registration (list/kanban), lead management, commission tracking (with dispute workflow), document sharing, training, announcements, support cases. Automated partner tier promotion (Silver: $100k, Gold: $250k, Platinum: $500k YTD revenue).
- **CMS Admin Panel**: Comprehensive management for blog, services, testimonials, team, FAQ, contacts, quotes, tickets, proposals, users, and reporting.
- **Invoicing System**: Admin creation/management, client viewing in portal.
- **Reporting**: Admin dashboard with key business metrics (clients, tickets, quotes, proposals, revenue, invoice status breakdown).

## API Server Structure
The `api-server` organizes routes logically into modules for authentication (`auth.ts`), CMS (`cms.ts`), quotes (`quotes.ts`), partners (`partners.ts`), documents (`documents.ts`), and support tickets (`tickets.ts`), and chat (`chat.ts`). Middleware handles authentication and authorization (`requireAuth`, `requireAdmin`).

## Database Schema
The database uses PostgreSQL and Drizzle ORM. Key tables include `users`, `contacts`, `quotes`, `tickets`, `chat_messages`, `blog_posts`, `activity_log`, `quote_proposals`, `settings`, `services`, `testimonials`, `team_members`, `faqs`, `partners`, `partner_deals`, `partner_leads`, `partner_resources`, `partner_commissions`, and tables for TSD integration (`tsd_configs`, `tsd_sync_logs`, `tsd_deal_mappings`, `tsd_products`).

## TSD Integration Specifics
- **Modular Adapters**: Uses `lib/integrations-tsd/` for provider-specific logic (AvantAdapter, TelarusAdapter, IntelisysAdapter).
- **Secure Credential Management**: Encrypts sensitive TSD credentials (API keys, passwords, MFA codes) using AES-256-GCM with `TSD_SECRETS_KEY`.
- **MFA Handling**: Special integration for Telarus SMS-based MFA via a Zoom Phone webhook, automatically extracting and storing MFA codes.
- **Product Catalog**: Centralized, manageable product catalog that feeds into deal registration forms, replacing hardcoded options.
- **Webhook Processing**: Handles inbound webhooks from TSDs for real-time updates on deals, leads, and commissions, with HMAC verification.
- **Commission Reconciliation**: Tracks discrepancies between local and TSD commission records using `tsd_deal_mappings` and `tsd_discrepancy` fields.

# Security Notes

- **Vite**: Pinned to `^7.3.2` in the pnpm workspace catalog to address CVE file-system bypass (GHSA-v2wj-q39q-566r)
- **axios override**: Added `"axios": ">=1.15.0"` in root `package.json` pnpm overrides to patch SSRF vulnerabilities (GHSA-3p68-rc4w-qgx5, GHSA-fvcv-3m26-pcqx) coming through `mailgun.js`
- **Email templates**: All user-provided data in `email.ts` HTML templates is escaped through the `esc()` helper function
- **Legal pages**: `/privacy` and `/terms` both exist with proper routes in App.tsx

# External Dependencies

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **API Framework**: Express
- **Validation**: Zod
- **Email Service**: Nodemailer (via SMTP)
- **Authentication**:
    - `bcryptjs` for password hashing
    - `jsonwebtoken` for JWT generation and verification
    - Microsoft SSO
    - Okta SSO (requires `OKTA_CLIENT_ID`, `OKTA_CLIENT_SECRET`, `OKTA_DOMAIN`, `OKTA_REDIRECT_URI`)
    - Replit OIDC (via `openid-client`)
- **AI Integration**: OpenAI API (for GPT-5.2)
- **TSD Integrations**:
    - Avant (API key)
    - Telarus (username/password, SMS MFA via Zoom Phone webhook)
    - Intelisys (API key, partner ID)
- **Zoom**:
    - Zoom Server-to-Server OAuth (`ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_SECRET`)
    - Zoom Phone API (for SMS webhook at `POST /api/webhooks/zoom/sms`)
- **Monorepo Tool**: pnpm workspaces