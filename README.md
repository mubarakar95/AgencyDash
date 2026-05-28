# AgencyDash — Software Agency Management Dashboard

A modern, full-stack dashboard for managing software agency projects, clients, renewals, team, and automated follow-ups.

## Features

- **Project Management**: Track projects from lead to delivery with progress bars, deadlines, and budgets.
- **Client CRM**: Manage client profiles, communication history, and project associations.
- **Renewal Tracker**: Monitor domain, hosting, SSL, and license expirations with color-coded alerts.
- **Follow-up Automation**: Schedule and manage client outreach with status tracking.
- **Team Management**: Tag developers by skill, monitor workload, and assign projects.
- **Settings**: Notification preferences, timezone, and agency branding.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Getting Started

### 1. Clone & Install

```bash
cd agency-dash
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New Query**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run**

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find these in your Supabase project settings under **API**.

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

### 5. Seed Data (Optional)

You can insert sample data directly from the Supabase Table Editor, or build forms in the UI.

## Database Schema

### Projects
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | Required |
| client_id | uuid | FK → clients |
| status | text | lead/quoted/active/in-progress/review/delivered/maintenance |
| deadline | date | |
| progress | integer | 0-100 |
| budget | decimal | |
| spent | decimal | |

### Clients
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | Required |
| email | text | Unique |
| phone | text | |
| company | text | |
| status | text | active/lead/inactive |
| last_contact | date | |

### Renewals
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| asset_name | text | Required |
| type | text | domain/hosting/ssl/license |
| client_id | uuid | FK → clients |
| expiry_date | date | Required |
| cost | decimal | |
| provider | text | |
| status | text | safe/warning/critical/expired |
| auto_renew | boolean | |

### Team Members
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | Required |
| email | text | Unique |
| role | text | |
| tags | text[] | Skills array |
| workload | integer | 0-100 |
| active_projects | integer | |

### Follow-ups
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| client_id | uuid | FK → clients |
| type | text | proposal/project_checkin/renewal_notice/invoice_reminder/custom |
| scheduled_date | date | Required |
| status | text | pending/sent/completed/snoozed |
| message | text | |
| sequence_step | integer | |

## Roadmap

- [x] Phase 1: MVP with mock data
- [x] Phase 2: Supabase backend, Follow-ups, real data
- [ ] Phase 3: Client Portal, Time Tracking, Invoicing
- [ ] Phase 4: Email notifications, Calendar sync, Analytics

## License

MIT
