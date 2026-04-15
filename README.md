# NIT KKR Classrooms — Setup Guide

## Quick Start

```bash
# 1. Extract ZIP, enter folder
cd nitkkr-v2

# 2. Install dependencies
npm install

# 3. Copy and fill env file
cp .env.example .env.local
# Fill in your values (see below)

# 4. Run
npm run dev
```

Visit http://localhost:3000 → redirects to login.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx   # Gmail App Password
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Supabase Setup

### 1. Database
Run your base schema SQL, then run `supabase_rls.sql`.

### 2. Authentication Settings
**Authentication → Settings:**
- ✅ Confirm email → **OFF**
- Allow new users to sign up → OFF (optional, admin creates all users)

**Authentication → URL Configuration:**
- Site URL: `http://localhost:3000`
- Redirect URLs: Add `http://localhost:3000/**`

### 3. Email Template (Reset Password)
**Authentication → Email Templates → Reset Password:**
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/auth/reset-password">Reset Password</a></p>
```

### 4. Create Admin User
In Supabase **Authentication → Users → Add User** (use button, not invite):
- Enter email + password
- Copy the UUID

Then in SQL Editor:
```sql
INSERT INTO public.departments (id, name, email, is_admin)
VALUES ('PASTE-UUID-HERE', 'Admin', 'your-admin@email.com', true);
```

### 5. Gmail App Password
1. Google Account → Security → 2-Step Verification (enable)
2. App Passwords → generate for "Mail"
3. Use the 16-char code as `EMAIL_PASS`

---

## Auth Flow (PKCE — how reset password works)

```
User clicks "Forgot Password"
  → POST /api/auth/forgot-password
  → Supabase generates recovery link with token_hash
  → Nodemailer sends email with link
  → User clicks link in email
  → Goes to /auth/callback?token_hash=xxx&type=recovery&next=/auth/reset-password
  → Callback route calls supabase.auth.verifyOtp() → sets session cookie
  → Redirects to /auth/reset-password
  → User sets new password (session already active)
  → supabase.auth.updateUser({ password }) succeeds
  → Signs out → redirects to login
```

---

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── callback/route.ts       ← PKCE token exchange
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── admin/
│   │   ├── layout.tsx              ← Admin auth guard
│   │   ├── dashboard/page.tsx
│   │   ├── departments/page.tsx
│   │   ├── rooms/page.tsx
│   │   ├── rooms/[id]/page.tsx     ← Schedule grid
│   │   └── settings/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx              ← User auth guard
│   │   ├── page.tsx
│   │   ├── rooms/page.tsx
│   │   ├── rooms/[id]/page.tsx     ← View + edit own slots
│   │   └── settings/page.tsx
│   └── api/
│       ├── admin/departments/      ← POST, PATCH/:id, DELETE/:id
│       ├── admin/rooms/            ← POST, DELETE/:id
│       ├── admin/schedules/        ← POST (upsert), upload/POST
│       ├── auth/forgot-password/   ← POST
│       └── user/schedules/         ← PATCH
├── components/
│   ├── shared/Sidebar.tsx
│   ├── admin/DepartmentsClient.tsx
│   ├── admin/RoomsAdminClient.tsx
│   ├── admin/AdminScheduleClient.tsx
│   ├── user/UserRoomsClient.tsx
│   └── user/UserScheduleClient.tsx
├── lib/
│   ├── supabase/client.ts          ← Browser client
│   ├── supabase/server.ts          ← Server + Admin clients
│   ├── email.ts                    ← Nodemailer
│   ├── excel.ts                    ← xlsx parse/generate
│   └── utils.ts
├── types/index.ts
├── hooks/use-toast.ts
└── middleware.ts                   ← Session guard (getSession)
```

---

## Excel Schedule Format

| Period   | Monday | Tuesday | Wednesday | Thursday | Friday | Saturday |
|----------|--------|---------|-----------|----------|--------|----------|
| Period 1 | CSE    | ECE     |           | ME       |        | CSE      |
| Period 2 | ...    | ...     | ...       | ...      | ...    | ...      |
| Period 8 | ...    | ...     | ...       | ...      | ...    | ...      |

- Department names must match exactly what's in the system (case-insensitive)
- Download template from room page first

---

## Deployment (Vercel)

1. Push to GitHub
2. Import in vercel.com
3. Add all env vars
4. Change `NEXT_PUBLIC_SITE_URL` to your Vercel domain
5. Update Supabase redirect URLs to include your Vercel domain
6. Update Supabase reset password email template SiteURL
