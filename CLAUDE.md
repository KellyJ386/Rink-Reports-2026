# MFO -- Rink Reports

## Project Guide v2 | CLAUDE.md

**Primary audience:** Claude Code (AI coding agent)
**Live pilot:** Tennity Ice Skating Pavilion, Syracuse University

---

## 1. Project Overview

**Max Facility Rink Reports** is a SaaS platform that digitizes and streamlines operations for ice rink facilities across North America. It replaces paper-based processes with an intuitive, mobile-first Progressive Web App (PWA).

- **Target market:** 2,500+ North American ice facilities (municipal, private, NHL, university, Olympic)
- **Pilot facility:** Tennity Ice Skating Pavilion, Syracuse University, 511 Skytop Rd, Syracuse NY 13244
- **Live URL:** rinkreports.com
- **Pricing:** $79.99/month or $959.88/year (Single Facility)
- **Stripe Price ID:** `price_1T6D791i1i5pKwnKeCc3xI6N`

---

## 2. Tech Stack

| Layer              | Technology                                    |
|--------------------|-----------------------------------------------|
| Framework          | Next.js 14 (App Router), TypeScript strict    |
| Styling            | Tailwind CSS with custom design tokens        |
| State Management   | React Context + useReducer                    |
| Database           | Supabase (PostgreSQL) -- NO Prisma, NO custom ORM |
| Authentication     | Supabase Auth only -- NO NextAuth.js          |
| PWA                | next-pwa -- offline + service worker (top priority) |
| Diagrams           | SVG-based custom components (rink, body)      |
| Export             | jsPDF + xlsx (planned)                        |
| Testing            | Jest + React Testing Library                  |
| Linting            | ESLint + Prettier                             |
| Hosting            | Vercel                                        |

### External Integrations

| Service   | Role                          |
|-----------|-------------------------------|
| Stripe    | Billing source of truth       |
| Supabase  | App data source of truth      |
| HubSpot   | Downstream CRM only           |
| PostHog   | Analytics                     |

### Brand Tokens

| Color         | Hex       | CSS Variable         | Usage                           |
|---------------|-----------|----------------------|---------------------------------|
| Navy Blue     | `#002244` | `--color-primary`    | Headers, buttons, navigation    |
| Action Green  | `#69BE28` | `--color-success`    | Success states, CTAs            |
| Wolf Grey     | `#A5ACAF` | `--color-secondary`  | Secondary text, borders         |
| Alert Yellow  | `#FFB800` | `--color-warning`    | Warning states, over-threshold  |
| Alert Red     | `#D32F2F` | `--color-danger`     | Error states, critical alerts   |
| Dark BG       | `#001122` | `--color-dark-bg`    | Dark mode background            |

---

## 3. Architecture & Key Constraints

### Multi-Facility Isolation
- Every database query must be filtered by `facility_id`
- Row Level Security (RLS) enforced on all tables
- No shared logins across facilities

### Offline-First
- All forms queue to IndexedDB first, then attempt network write
- Sync indicator in header shows pending/syncing/synced state
- Auto-sync on reconnect
- 500ms debounce on auto-save drafts

### Dark Mode
- Full dark mode support required on all components
- Background inverts to `#001122` with light text
- Action Green remains accent color in both modes

### Mobile-First
- 48px minimum touch targets
- Portrait primary orientation for Ice Depth module
- Operable with cold hands, poor lighting, varying screen sizes
- No photos, no digital signatures anywhere in the app

### Accessibility
- WCAG 2.1 AA compliance required

### Database
- Supabase SQL Editor for schema changes
- Service role key used server-side only
- No Prisma, no custom ORM -- use Supabase client directly

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, forgot-password, reset-password)
│   ├── (dashboard)/        # Main app layout with sidebar
│   │   ├── dashboard/      # Dashboard hub
│   │   ├── daily-reports/  # Daily Reports module
│   │   ├── ice-depth/      # Ice Depth Management
│   │   ├── ice-operations/ # Ice Operations (ice cut, edging, circle check, blade change)
│   │   ├── scheduling/     # Employee Scheduling
│   │   ├── incidents/      # Incident Reporting
│   │   ├── refrigeration/  # Refrigeration Plant Logs
│   │   ├── air-quality/    # Air Quality Monitoring
│   │   └── admin/          # Admin Control Center
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Base UI components (Button, Input, Modal, etc.)
│   ├── layout/             # Sidebar, Header, Breadcrumbs, MobileNav
│   ├── diagrams/           # RinkDiagram, BodyDiagram SVG components
│   ├── scheduling/         # Calendar views, shift blocks
│   └── forms/              # Reusable form patterns (Checklist, ReadingEntry)
├── lib/
│   ├── supabase/           # Supabase client (browser + server)
│   ├── offline/            # IndexedDB queue, sync logic
│   ├── notifications/      # Notification service
│   ├── validations/        # Zod schemas
│   └── utils/              # Shared utilities
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── styles/                 # Global styles, Tailwind config
```

### Coding Conventions

- TypeScript strict mode -- no `any`, no `@ts-ignore`
- Functional components only (no classes)
- kebab-case for file names
- Zod for all runtime validation
- Server Components by default; `'use client'` only when needed
- All API routes in `src/app/api/`
- All form submissions auto-stamped with user ID, date, and time

---

## 4. User Accounts & Authentication

### Auth Provider
- **Supabase Auth only** -- email + password
- NO NextAuth.js, NO third-party OAuth

### Two-Tier Account Creation
1. **Facility Admin**: Created during onboarding + Stripe checkout flow
2. **Staff**: Created by Facility Admin via Admin Control Center (never self-register)

### Profiles Table

| Column           | Purpose                                    |
|------------------|--------------------------------------------|
| `facility_id`   | Facility tenant isolation                  |
| `role`           | Permission level                           |
| `is_active`      | Active/deactivated flag                    |
| `position`       | Job title / position                       |
| `certifications` | Array of certification strings             |

### Roles (6 levels)

| Role             | Access Level                                    |
|------------------|------------------------------------------------|
| `super_admin`    | Full system access, all facilities              |
| `facility_admin` | Full access within their facility               |
| `manager`        | View all data, manage schedules, run reports    |
| `supervisor`     | Submit reports, view team data                  |
| `staff`          | Submit forms, view own schedule                 |
| `read_only`      | View reports and data only                      |

### Deactivation Policy
- Set `is_active: false` -- never delete auth records or history
- All `auth.admin.*` calls must be server-side only

---

## 5. Form Design Standards

### Performance
- Render in < 2 seconds
- Single-page forms only (no multi-step wizards)
- Auto-save drafts to IndexedDB with 500ms debounce

### Offline Queue
- Write to IndexedDB first, then attempt network
- Show sync status indicator in header
- Retry with exponential backoff on failure

### UI Requirements
- 48px minimum touch targets
- 16px minimum label font size
- Sticky submit button at bottom of viewport
- Inline validation errors (no alert dialogs)
- Numeric keyboard on mobile for number inputs (`inputMode="numeric"`)

---

## 6. Module Inventory

### 6.1 Daily Reports
- **Route:** `/dashboard/daily-reports`
- **Max tabs:** 15 (Tennity uses 10)
- Each tab has Opening / Closing / Daily Operations checklists
- Each checkbox auto-records timestamp + user
- Reset frequency: daily / weekly / monthly / seasonal
- Admin configures tab names and checklist items

### 6.2 Ice Depth Management
- **Route:** `/dashboard/ice-depth`
- **Max templates:** 8
- Interactive SVG rink diagram (USA Hockey 200ft x 85ft)
- **Portrait orientation** preferred on mobile
- Admin places numbered measurement points
- Dialog opens above tapped point for data entry
- Global minimum threshold configurable by admin
- Color thresholds: Green (1.00-1.74"), Yellow (1.75-3.50"), Red (0.00-0.99")
- Manual entry (Bluetooth caliper integration planned)

### 6.3 Ice Operations
- **Route:** `/dashboard/ice-operations`
- **Sub-tabs:** Ice Cut, Edging, Circle Check, Blade Change
- Circle Check: 30+ point configurable inspection checklist
- Failed items expand a notes field
- All operations timestamped with user ID

### 6.4 Employee Scheduling
- **Route:** `/dashboard/scheduling`
- Calendar views: Day / Week / Month
- Availability submission by staff
- Shift assignment by managers
- Shift swap with manager approval
- Open shift broadcasting
- Certifications tracked per position
- No time clock functionality

### 6.5 Incident Reporting
- **Route:** `/dashboard/incidents`
- **TWO separate forms:**
  - **Incident** (injury to a person) -- includes interactive SVG body diagram (front/back)
  - **Accident** (property damage) -- no body diagram
- 7-year data retention (configurable)
- No approval workflow

### 6.6 Refrigeration Plant Logs
- **Route:** `/dashboard/refrigeration`
- Fully custom equipment configuration (compressors, pumps, condensers)
- Configurable reading types per equipment
- High/low alert thresholds per reading type
- Manual entry every 2-3 hours

### 6.7 Air Quality Monitoring
- **Route:** `/dashboard/air-quality`
- Gases: CO, CO2, NO2
- Environmental: humidity, temperature
- Jurisdiction compliance engine (MA, MN, RI)
- 4-tier escalation for out-of-range readings
- Compliance PDF/Excel report generation for health inspectors

### 6.8 Admin Control Center
- **Route:** `/dashboard/admin`
- **Access:** Facility Admin only
- Sub-sections: Facility Settings, Rink Configuration, User Management, Module Settings, Equipment Setup, Threshold Settings, Notifications, Data Retention

---

## 7. HubSpot Integration

- **Downstream only** -- HubSpot never writes back to the app
- Triggered via webhooks from Supabase/Stripe events
- **On signup:** Create Company + Contact in HubSpot
- **On 30-day inactivity:** Tag contact as "At Risk"
- HubSpot is not involved in auth, billing, or app logic

---

## 8. Onboarding Flow

### 3 Steps
1. **Account Creation** -- email, password, name
2. **Facility Info** -- facility name, address, type, rink count
3. **Stripe Checkout** -- redirect to Stripe for payment

### Tennity Pilot
- Tennity Ice Skating Pavilion is provisioned manually (not through onboarding flow)

---

## 9. Build Stages & Multi-Agent Strategy

### Agent Roles
| Agent         | Responsibility                              |
|---------------|---------------------------------------------|
| Lead          | Orchestration, integration, final QA        |
| Foundation    | Auth, layout, shared components, types      |
| Module (x8)   | One agent per module                        |
| Admin         | Admin Control Center                        |
| Offline       | IndexedDB, sync queue, service worker       |
| Integration   | Stripe, HubSpot, PostHog                    |

### Per-Module CLAUDE.md
Each module gets its own `CLAUDE.md` with module-specific instructions, schema, and constraints.

### Git Strategy
- One branch per agent/module
- PRs merged to `main` via Lead agent review

### 4 Validation Gates
1. `tsc --noEmit` -- TypeScript compiles clean
2. RLS policies verified on all tables
3. Offline queue tested (disconnect/reconnect)
4. Vercel preview deployment succeeds

### 6 Build Phases
1. Foundation (auth, layout, types, shared components)
2. Core modules (Daily Reports, Ice Operations, Ice Depth)
3. Supporting modules (Scheduling, Incidents)
4. Monitoring modules (Refrigeration, Air Quality)
5. Admin Control Center
6. Integration, offline hardening, final QA

---

## 10. Tennity Pilot Reference

### Daily Report Tabs (10)
Configured for Tennity's operational needs.

### Equipment
- 3 equipment groups
- 4 compressors
- 3 readings per shift

### Default Certifications
- Zamboni Operator
- First Aid / CPR
- AED

---

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
```

---

## Key Conventions

- Use App Router (not Pages Router)
- Server Components by default; `'use client'` only when needed
- All API routes in `src/app/api/`
- Form submissions always include automatic timestamp + user ID
- Color thresholds are always admin-configurable
- Equipment/checklist items are always admin-configurable
- Every module must work offline
- Export support: PDF, CSV, Excel for all report types
- No Prisma -- use Supabase client directly
- No NextAuth.js -- use Supabase Auth directly
