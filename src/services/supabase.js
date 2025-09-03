import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anonymous Key. Please check your environment variables.');
}

// Create a single supabase client for the entire app
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Auth related functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signInWithEmail = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const signUp = async (email, password) => {
  return await supabase.auth.signUp({
    email,
    password,
  });
};

// Helper to check if a user has admin role
export const isAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  if (error || !data) return false;
  return data.role === 'admin';
};

// Helper to check if a user has category admin role
export const isCategoryAdmin = async (category) => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const { data, error } = await supabase
    .from('category_admins')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', category)
    .single();
    
  if (error || !data) return false;
  return true;
};
