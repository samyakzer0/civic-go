-- Alternative approach: Disable RLS for notifications table
-- This allows the app to handle user filtering instead of relying on database policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anonymous users can view notifications" ON public.notifications;

-- Disable RLS on notifications table
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to all users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO anon;
