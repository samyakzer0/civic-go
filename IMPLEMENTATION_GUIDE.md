# CivicGo Implementation Guide

## Setting Up the Environment

Create a `.env` file in the root directory with the following variables:

```
# Supabase configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Vision API key
VITE_VISION_AI_API_KEY=your_google_vision_api_key_here
```

## Cloud Vision API Implementation

The Cloud Vision API is implemented in `src/services/AIService.ts`. The service will:

1. Use the Google Vision API if the API key is available
2. Fall back to mock analysis if the API key is missing or the API call fails

To verify the API is working:

1. Make sure your `.env` file has a valid `VITE_VISION_AI_API_KEY`
2. Open the browser console when submitting a report with an image
3. You should see the API response logged or any potential errors

## Accessing the Admin Panel

The admin panel is implemented but only accessible to users with admin privileges. Here's how to access it:

### Method 1: Through the Profile Page

1. Sign in to the application
2. Navigate to the Profile page
3. If you have admin privileges, you'll see an "Admin Panel" option with a shield icon
4. Click on this option to access the admin panel

### Method 2: Direct URL Navigation

You can also access the admin panel directly by adding `/admin` to the URL or by modifying the code to add a direct admin link.

### Creating an Admin User

To create an admin user in Supabase:

1. Sign up a user through the application
2. In your Supabase dashboard, go to the SQL editor
3. Run the following SQL to grant admin privileges to a user:

```sql
-- Replace 'user_id_here' with the actual user ID
INSERT INTO user_roles (user_id, role)
VALUES ('user_id_here', 'admin');
```

## Debugging Admin Access

If you still can't see the admin panel:

1. Check if the user is properly authenticated by logging `await isAdmin()` in the console
2. Verify that the `user_roles` table exists in your Supabase database
3. Make sure the currently logged-in user has an entry in the `user_roles` table with role = 'admin'

## Adding Admin Panel Access to All Users (Development Only)

For testing purposes, you can modify the `ProfilePage.tsx` file to always show the admin panel link:

```typescript
// In ProfilePage.tsx, modify the useEffect hook
useEffect(() => {
  // For development, always set admin access to true
  setIsAdminUser(true);
  setHasCategoryAccess(true);
}, []);
```

Or add a temporary admin navigation button to the app's bottom navigation bar in `App.tsx`.
