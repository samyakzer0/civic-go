import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase URL or Anonymous Key. Using fallback local storage for now.');
}

// Create a single supabase client for the entire app
export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

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
