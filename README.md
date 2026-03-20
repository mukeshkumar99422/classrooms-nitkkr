# Classroom Scheduling App (NIT Kurukshetra)

A full-stack classroom and schedule management application built for the National Institute of Technology, Kurukshetra. This platform streamlines the process of allocating and managing classrooms across various departments.

## Features

### 👨‍💼 Admin Features
- **Department Management**: Complete CRUD operations for adding, editing, and mapping departments to their respecive emails. Automatically sends a welcome email with credentials via **Gmail API** upon department creation.
- **Room Management**: Add, view, and manage available rooms across the institute.
- **Schedule Management**: Upload and manage consolidated schedules for rooms via Excel uploads or manual input.

### 🏢 Department User Features
- **Schedules Viewing**: View complete, up-to-date schedules of assigned rooms.
- **Slot Editing**: Edit your own department's allocated schedule slots mapped appropriately to time tables.
- **Exporting**: Download personalized schedules to maintain offline records.
- **Consolidated View**: Have an overarching view of complete departmental schedules.

### 🔒 Authentication & System
- **Role-Based Access Control**: Different dashboards and access privileges specifically routed for Admins and Departments.
- **Secure Authentication**: Built using robust Supabase Auth.
- **Password Recovery**: Integrated password resets and secure email updates.
- **Theme**: User-friendly UI with dark mode support and amber accents, optimized for smooth user experience.

## Technology Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Database
- **BaaS**: [Supabase](https://supabase.com/) (PostgreSQL & Authentication)
- **Mailing Service**: Custom `nodemailer` integrated with Google Gmail API (OAuth2)
- **Excel Processing**: `xlsx` for parsing uploaded schedule data

## Getting Started

### Prerequisites
- Node.js 18.x or later installed.
- Supabase Project setup with tables configured for User Roles, Rooms, Departments, and Schedules.
- Gmail API credentials built for Google Workspace or isolated Google Cloud Projects.

### Environment Setup

Create a `.env.local` file in the root directory and add the following keys:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Gmail Integration (For Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Site Setup
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Installation

1. Install dependencies:
   ```bash
   npm install
   # or yarn install
   # or pnpm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   # or yarn dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to explore the scheduling app.

## Contributing

This is a specific internal scheduling utility made for NIT KKR. For queries or contributions, please contact the repository administrators.
