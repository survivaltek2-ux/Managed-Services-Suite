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

**Features:**
- Live chat widget (bottom-right, session-based)
- Client authentication (register/login/JWT)
- Support ticket system (create, list, view)
- Contact form submission
- Quote request form
- All data persisted to PostgreSQL

### `artifacts/api-server` — Express API Server
Backend for the Siebert Services website.

**Routes:**
- `GET /api/healthz` — Health check
- `POST /api/auth/register` — Register client
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (requires auth)
- `POST /api/contact` — Submit contact form
- `POST /api/quotes` — Submit quote request
- `GET /api/tickets` — List tickets (requires auth)
- `POST /api/tickets` — Create ticket (requires auth)
- `GET /api/tickets/:id` — Get ticket (requires auth)
- `GET /api/chat/messages?sessionId=xxx` — Get chat messages
- `POST /api/chat/messages` — Send chat message

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── siebert-services/   # React + Vite MSP website
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

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
