# TaskFlow — Frontend

A modern, real-time Task Management Platform frontend built with **Next.js 14 (App Router)**, TypeScript, and Tailwind CSS.

## ✨ Features

- **Futuristic UI** — Glassmorphism cards, animated gradient orbs, dark theme
- **JWT Authentication** — Auth context with localStorage + cookie-based middleware guard
- **Task CRUD** — Create, read, update, delete with modal dialogs
- **Filtering & Pagination** — Status, priority, search, sort with debouncing
- **Drag & Drop Upload** — Per-file progress bars via `react-dropzone` + axios `onUploadProgress`
- **Real-time** — Task status updates & live comments via Laravel Echo + Pusher
- **Toast Notifications** — `sonner` for success/error feedback throughout

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Laravel backend running at `http://localhost:8000`

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.local` and fill in your values:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
```

> **Laravel Reverb**: Uncomment the Reverb block in `src/lib/echo.ts` and set `NEXT_PUBLIC_REVERB_HOST`.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Start the Laravel backend

```bash
cd ../backend
php artisan serve
php artisan queue:work     # For email notifications + thumbnail processing
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── (auth)/login/           # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Protected layout
│   │   ├── tasks/page.tsx      # Task list + filters
│   │   ├── tasks/[id]/page.tsx # Task detail + upload + comments
│   │   └── profile/page.tsx
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Design tokens
├── components/
│   ├── ui/                     # Button, Input, Modal, Badge, Spinner
│   ├── tasks/                  # TaskCard, TaskList, TaskModal, TaskFilters
│   ├── upload/                 # DropZone
│   ├── comments/               # CommentSection (real-time)
│   └── layout/                 # Sidebar, Topbar
├── contexts/AuthContext.tsx     # JWT auth state
├── hooks/
│   ├── useTasks.ts             # React Query task hooks
│   ├── useAuth.ts
│   └── useEcho.ts              # Real-time subscriptions
├── lib/
│   ├── axios.ts                # Axios instance + interceptors
│   ├── echo.ts                 # Laravel Echo setup
│   └── utils.ts                # Helpers
└── types/index.ts              # TypeScript interfaces
middleware.ts                   # Route protection
```

---

## 🔌 API Integration

All API calls target `NEXT_PUBLIC_API_URL`. The axios instance automatically:
- Attaches `Authorization: Bearer <token>` from localStorage
- Redirects to `/login` on 401 responses

### Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Get JWT token |
| POST | `/auth/logout` | Invalidate token |
| GET | `/tasks` | List with pagination/filters |
| POST | `/tasks` | Create task |
| GET | `/tasks/{id}` | Task detail |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| POST | `/tasks/{id}/attachments` | Upload file |
| DELETE | `/attachments/{id}` | Delete attachment |
| POST | `/tasks/{id}/comments` | Post comment |
| POST | `/tasks/bulk-update` | Bulk status update |

---

## ⚡ Real-time Events (Laravel Echo)

The frontend subscribes to private channels:

| Channel | Event | Effect |
|---------|-------|--------|
| `tasks.{userId}` | `TaskStatusUpdated` | Refreshes task list cache |
| `tasks.{taskId}.comments` | `CommentPosted` | Appends comment live |

Configure the backend to broadcast these events via Pusher or Laravel Reverb.

---

## 🛠 Tech Stack

| Package | Purpose |
|---------|---------|
| `next` 15 | App Router framework |
| `@tanstack/react-query` | Server state & caching |
| `axios` | HTTP client |
| `react-dropzone` | Drag & drop uploads |
| `lucide-react` | Icons |
| `sonner` | Toast notifications |
| `laravel-echo` + `pusher-js` | Real-time |
| `framer-motion` | Animation (available for extensions) |
| `react-hook-form` + `zod` | Form handling (available for extensions) |
