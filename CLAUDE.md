# Max Facility Rink Reports - CLAUDE.md

## Product Overview

**Max Facility Rink Reports** is a comprehensive SaaS platform that digitizes and streamlines operations for ice rink facilities across North America. It replaces paper-based processes with an intuitive, mobile-first Progressive Web App (PWA).

**Target Market**: 2,500+ ice rink facilities (municipal, private, NHL, university, Olympic).

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React Context + useReducer for global state; local state for forms
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: NextAuth.js (email/password v1)
- **PWA**: next-pwa with offline form queuing via IndexedDB
- **Charts/Diagrams**: SVG-based custom components (rink diagram, body diagram)
- **Export**: jsPDF + xlsx for report generation
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, forgot-password, reset-password)
│   ├── (dashboard)/        # Main app layout with sidebar
│   │   ├── dashboard/      # Dashboard hub
│   │   ├── daily-reports/  # Daily Reports module
│   │   ├── ice-depth/      # Ice Depth Management
│   │   ├── ice-operations/ # Ice Operations (makes, blades, edging, circle-check)
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
│   ├── db/                 # Prisma client, schema
│   ├── auth/               # Auth configuration
│   ├── offline/            # IndexedDB queue, sync logic
│   ├── notifications/      # Notification service
│   └── utils/              # Shared utilities
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── styles/                 # Global styles, Tailwind config
```

## Brand Guidelines

### Color Palette
| Color         | Hex       | CSS Variable          | Usage                              |
|---------------|-----------|----------------------|-------------------------------------|
| Navy Blue     | `#002244` | `--color-primary`    | Headers, buttons, navigation        |
| Action Green  | `#69BE28` | `--color-success`    | Success states, CTAs                |
| Wolf Grey     | `#A5ACAF` | `--color-secondary`  | Secondary text, borders, disabled   |
| Alert Yellow  | `#FFB800` | `--color-warning`    | Warning states, over-threshold      |
| Alert Red     | `#D32F2F` | `--color-danger`     | Error states, critical alerts       |
| Dark Navy     | `#001122` | `--color-dark-bg`    | Dark mode background                |

### Dark Mode
Full dark mode support required. Background inverts to `#001122` with light text. Action Green remains the accent color. All components must work in both modes.

## User Roles & Permissions

| Role          | Access Level                                    |
|---------------|------------------------------------------------|
| Super Admin   | Full system access, all facilities              |
| Facility Admin| Full access within their facility                |
| Manager       | View all data, manage schedules, run reports    |
| Supervisor    | Submit reports, view team data                   |
| Staff/Operator| Submit forms, view own schedule                  |
| Read-Only     | View reports and data only                       |

Modules and tabs are enabled/disabled per role via Admin Control Center.

## Core Modules

### 1. Dashboard
Central navigation hub with large touch-friendly buttons (120px min height). Grid layout: 2 cols mobile, 3 cols tablet, 4 cols desktop with sidebar. Alert badges (red dot with count) on buttons needing attention.

### 2. Daily Reports
Up to 30 configurable tabs (Front Desk, Zamboni Log, etc.). Each tab has Opening/Closing/Daily Operations checklists. Each checkbox auto-records timestamp + user. Reset frequency: daily/weekly/monthly/seasonal.

### 3. Ice Depth Management
Interactive SVG rink diagram (USA Hockey 200ft x 85ft). Admin places numbered measurement points. Color thresholds: Green (1.00-1.74"), Yellow (1.75-3.50"), Red (0.00-0.99"). Supports Bluetooth caliper integration + manual entry.

### 4. Ice Operations
Four sub-tabs: Ice Makes, Blade Change, Edging, Circle Check. Circle Check is a 30+ point configurable inspection checklist. Failed items expand a notes field.

### 5. Employee Scheduling
Calendar views (Day/Week/Month). Availability submission, shift assignment, shift swap with manager approval, open shift broadcasting. No time clock.

### 6. Incident Reporting
Incident vs Accident types. Interactive SVG body diagram (front/back) for marking injury locations. 7-year data retention. No approval workflow.

### 7. Refrigeration Plant Logs
Customizable equipment monitoring (compressors, pumps, condensers). Configurable reading types and alert thresholds. Manual entry every 2-3 hours.

### 8. Air Quality Monitoring
CO, CO2, NO2, humidity, temperature tracking. Compliance PDF/Excel report generation for health inspectors.

### 9. Admin Control Center
Facility Settings, Rink Configuration, User Management, Module Settings, Equipment Setup, Threshold Settings, Notifications, Data Retention.

## Design Principles

1. **Mobile-first**: Operable with cold hands, poor lighting, varying screen sizes
2. **Minimum touch target**: 48x48 pixels
3. **Offline-first**: Forms queue locally via IndexedDB, auto-sync on reconnect
4. **Simple and fast**: Quick loading pages, easily saved reports
5. **No photos, no digital signatures** anywhere in the app
6. **All form submissions** auto-stamped with user ID, date, and time

## Navigation Patterns

- **Desktop**: Collapsible sidebar (left) with logo, module nav, user profile, settings. Breadcrumbs below header.
- **Mobile/Tablet**: Hamburger menu reveals sidebar as overlay. Dashboard is touch-friendly grid.

## Notifications

- **Channels**: In-app (bell icon), Email, SMS (critical alerts)
- **Triggers**: Out-of-range readings, incidents submitted, shift reminders, swap requests, open shifts

## Data Architecture

- Multi-facility with complete tenant isolation (no shared logins)
- Standard data retention: 3 years (configurable)
- Incident data retention: 7 years (configurable)
- Archive mode for seasonal facilities

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run db:push      # Push Prisma schema to database
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database with sample data
```

## Key Conventions

- Use App Router (not Pages Router)
- Server Components by default; 'use client' only when needed
- All API routes in `src/app/api/`
- Form submissions always include automatic timestamp + user ID
- Color thresholds are always admin-configurable
- Equipment/checklist items are always admin-configurable
- Every module must work offline
- Export support: PDF, CSV, Excel for all report types
