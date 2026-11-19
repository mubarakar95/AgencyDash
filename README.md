# AgencyDash — Full-Stack Agency Management Dashboard & Client Portal

A modern, open-source agency operating system built with Next.js 16, React 19, Tailwind CSS, and Supabase. Manage projects, tasks, client relationships, multi-currency invoices, recurring asset renewals, team workloads, and dedicated client portals from a single unified workspace.

---

## Highlights & Capabilities

* **Interactive Project & Task Management**: Drag-and-drop Kanban workflow powered by `@dnd-kit`, task discussions, file attachments, and completion milestones.
* **Client CRM & Directory**: Centralized client profiles, project histories, contact schedules, and associated billing records.
* **Invoicing & Payments**: Built-in invoice generator supporting multi-currency billing (INR/USD), line items, automated total conversion, discounts, and print/PDF views.
* **Recurring Renewal Tracker**: Monitor domain registrations, hosting accounts, SSL certificates, and software licenses with warning indicators.
* **Dedicated Client Portal**: Secure, authenticated interface allowing clients to view ongoing projects, open tickets, track renewals, and view invoices.
* **Support Ticket Desk**: Interactive issue tracking with comments, link sharing, and status updates between agency staff and clients.
* **Team Capacity & Skills**: Monitor developer workload, active project loads, and skill assignments.
* **White-Label Agency Settings**: Customize your agency business name, address, payment details, tax IDs, and logo directly through the settings interface.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & UI** | Tailwind CSS v4, Lucide React icons |
| **State & Interactions** | `@dnd-kit/core`, `@dnd-kit/sortable`, Recharts |
| **Backend & Database** | Supabase (PostgreSQL, Row Level Security, Auth, Storage) |

---

## Quickstart Guide

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/mubarakar95/AgencyDash.git
cd AgencyDash
npm install
```

### 2. Configure Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Run the base schema from `supabase/schema.sql`.
4. Apply the feature migrations in order from the `supabase/` directory (or the specific tables you require).

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your project credentials from your Supabase Dashboard (**Project Settings** → **API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 4. Run the Development Server

```bash
npm run dev
```

Navigate to [http://localhost:3001](http://localhost:3001) in your browser.

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── admin/users/        # Team and user role management
│   │   ├── calendar/           # Milestone and renewal calendar
│   │   ├── clients/            # Client CRM and directory
│   │   ├── invoices/           # Invoicing and printable bill templates
│   │   ├── payments/           # Financial transactions and receipts
│   │   ├── portal/             # Client-facing portal views
│   │   ├── projects/           # Project boards and detail views
│   │   ├── renewals/           # Domain, hosting, and SSL expiration alerts
│   │   ├── settings/           # Agency branding, tax info, and preferences
│   │   ├── tasks/              # Kanban task board
│   │   ├── team/               # Team member roster and workload
│   │   ├── tickets/            # Support ticket system
│   │   └── time-tracking/      # Work log and time entry
│   ├── components/             # Reusable UI cards, modals, and navigation
│   ├── contexts/               # Supabase authentication provider
│   └── lib/                    # Supabase browser, server, and admin clients
└── supabase/                   # PostgreSQL table schemas and migrations
```

---

## License

This project is licensed under the MIT License.
