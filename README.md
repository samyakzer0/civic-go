# CivicGo

CivicGo is a citizen-centric civic issue reporting platform designed to bridge the communication gap between citizens and local authorities.

## Features

- Report civic issues with image capture and AI detection
- Track report status
- Category-based admin panel for managing reports
- Multi-language support
- Dark/Light theme
- Engaging animations and visual feedback

## Tech Stack

- React + TypeScript
- Vite
- TailwindCSS
- Supabase for backend and authentication
- Lucide icons
- Lottie animations for engaging UI

## Environment Setup

1. Copy `.env.example` to `.env`
2. Set up a Supabase project at [https://supabase.com](https://supabase.com)
3. Add your Supabase URL and anon key to the `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. (Optional) Add Google Maps API key for better location functionality:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Supabase Database Setup

Create the following tables in your Supabase project:

### Reports Table

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location JSONB NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  user_id TEXT NOT NULL
);

-- Create index for faster queries
CREATE INDEX reports_user_id_idx ON reports(user_id);
CREATE INDEX reports_category_idx ON reports(category);
CREATE INDEX reports_status_idx ON reports(status);
CREATE INDEX reports_report_id_idx ON reports(report_id);
```

### User Roles Table

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX user_roles_user_id_idx ON user_roles(user_id);
```

### Category Admins Table

```sql
CREATE TABLE category_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX category_admins_user_id_idx ON category_admins(user_id);
CREATE INDEX category_admins_category_idx ON category_admins(category);
```

### Storage Setup

Create a `report-images` bucket with public access for storing report images.

## Development

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Admin Panel

Admin users can access the admin panel by signing in and accessing it from their profile. There are two types of admin users:

1. **Super Admin** - Has access to all categories and can manage all reports
2. **Category Admin** - Has access to reports for specific categories only

To make a user an admin, add a record to the `user_roles` table with `role = 'admin'` for super admin access, or add a record to the `category_admins` table with the specific category for category-specific access.
