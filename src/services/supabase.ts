import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
// Try both import.meta.env (Vite standard) and process.env (our custom define)
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL) || 
  'https://xxhdyvsiabdwvzkyhboi.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY) || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4aGR5dnNpYWJkd3Z6a3loYm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4Mzk3MzksImV4cCI6MjA3MjQxNTczOX0.fsqxe4tlMU276QPPb7KY-KUTYSTFDhTsPNtFIIk7Mu0';

// Debug info to help troubleshoot environment variable loading
console.log('Supabase URL from import.meta.env:', import.meta.env.VITE_SUPABASE_URL ? 'Found' : 'Not found');
console.log('Supabase URL from process.env:', 
  typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL ? 'Found' : 'Not found');

if (!supabaseUrl.includes('xxhdyvsiabdwvzkyhboi.supabase.co')) {
  console.log('Using environment variables for Supabase configuration');
} else {
  console.warn('Environment variables not loaded from .env file. Using hardcoded fallbacks.');
  console.warn('Please check that your .env file exists and is being loaded correctly by Vite.');
}

// Create a single supabase client for the entire app
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Auth related functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};

export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    }
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({
    email,
    password,
  });
};

// Helper to check if a user has admin role
export const isAdmin = async (): Promise<boolean> => {
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
export const isCategoryAdmin = async (category: string): Promise<boolean> => {
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

// Helper to get admin categories for a user
export const getUserAdminCategories = async (): Promise<string[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('category_admins')
    .select('category')
    .eq('user_id', user.id);
    
  if (error || !data) return [];
  return data.map(item => item.category);
};
