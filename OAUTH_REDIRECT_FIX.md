# Fixing Google OAuth Redirect in CivicGo

## Issue

The Google OAuth redirect URL is incorrectly set to `civic-go.vercel.app` in the Supabase dashboard settings. This is causing the redirect to go to `https://xxhdyvsiabdwvzkyhboi.supabase.co/civic-go.vercel.app` with the access token appended as a hash, instead of redirecting back to your local development server.

## Solution

You need to update your OAuth settings in the Supabase dashboard:

### Step 1: Log in to Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com) and log in
2. Select your project (the one with URL: `https://xxhdyvsiabdwvzkyhboi.supabase.co`)

### Step 2: Update Authentication Settings

1. Navigate to **Authentication** in the left sidebar
2. Click on **Providers**
3. Find and click on **Google** to edit its settings
4. Update the **Site URL** field:
   - Set it to `http://localhost:5173` for local development
   - Remove any references to `civic-go.vercel.app` if you're developing locally

5. Update the **Redirect URLs** section:
   - Remove `civic-go.vercel.app` if it's listed
   - Add these URLs (or replace existing ones):
```
http://localhost:5173
http://localhost:5173/
http://127.0.0.1:5173
http://127.0.0.1:5173/
```

If you're using any other ports for development, add those too.

6. IMPORTANT: If you see any settings with `civic-go.vercel.app` as a domain but you're running locally, change them to use `localhost:5173` instead.

### Step 3: Update Google Cloud Console Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find and edit the OAuth 2.0 Client ID used for your app
4. Update the **Authorized redirect URIs** to include:
```
https://xxhdyvsiabdwvzkyhboi.supabase.co/auth/v1/callback
http://localhost:5173
http://localhost:5173/
```

### Step 4: Test the Authentication

1. Restart your development server
2. Try signing in with Google again
3. You should be redirected back to your application after authentication

## Troubleshooting

If you're still having issues:

1. Open the browser console to check for any authentication errors
2. Ensure your `.env` file has the correct Supabase URL and anonymous key
3. Verify that the Google OAuth credentials are correct in Supabase settings
4. Try clearing your browser cookies and cache before testing again

## Additional Notes

For production deployment, make sure to add your production domain to the authorized redirect URIs in both Supabase and Google Cloud Console.
