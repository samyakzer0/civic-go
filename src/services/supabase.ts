import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xxhdyvsiabdwvzkyhboi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4aGR5dnNpYWJkd3Z6a3loYm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4Mzk3MzksImV4cCI6MjA3MjQxNTczOX0.fsqxe4tlMU276QPPb7KY-KUTYSTFDhTsPNtFIIk7Mu0';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
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
  
  try {
    // Try fetching from user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error checking admin status:', error);
      
      // If the error is 406 Not Acceptable, likely the table doesn't exist
      // Throw the error so it can be caught by the AdminPage
      if (error.code === '406' || error.message.includes('406')) {
        const enhancedError = new Error('Table user_roles does not exist');
        (enhancedError as any).status = 406;
        (enhancedError as any).code = '406';
        throw enhancedError;
      }
      
      // For development: if there's another error,
      // check if the user email indicates admin access
      if (user.email && (user.email.endsWith('@admin.org') || user.email.includes('admin'))) {
        console.log('Development mode: Granting admin access based on email');
        return true;
      }
      return false;
    }
    
    // Check if any role is 'admin'
    if (data && data.length > 0) {
      return data.some(role => role.role === 'admin');
    }
    
    return false;
  } catch (e) {
    // Only log if it's not a 406 error we're deliberately throwing
    if (!((e as any).status === 406)) {
      console.error('Exception in isAdmin check:', e);
    }
    throw e;
  }
};

// Helper to check if a user has category admin role
export const isCategoryAdmin = async (category: string): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  try {
    // Try fetching from category_admins table without using .single()
    const { data, error } = await supabase
      .from('category_admins')
      .select('category')
      .eq('user_id', user.id)
      .eq('category', category);
    
    if (error) {
      console.error('Error checking category admin status:', error);
      // Development fallback: Allow certain users to be category admins
      if (user.email && (user.email.endsWith('@admin.org') || user.email.includes('admin'))) {
        console.log('Development mode: Granting category admin access based on email');
        return true;
      }
      return false;
    }
    
    // If any matching records were found, user is a category admin
    return data && data.length > 0;
  } catch (e) {
    console.error('Exception in isCategoryAdmin check:', e);
    return false;
  }
};

// Helper to get admin categories for a user
export const getUserAdminCategories = async (): Promise<string[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  
  try {
    const { data, error } = await supabase
      .from('category_admins')
      .select('category')
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error fetching admin categories:', error);
      
      // Development fallback: Return all categories for admin emails
      if (user.email && (user.email.endsWith('@admin.org') || user.email.includes('admin'))) {
        console.log('Development mode: Returning default categories based on email');
        return ['Roads', 'Water', 'Electricity', 'Sanitation', 'Other'];
      }
      return [];
    }
    
    return data.map(item => item.category);
  } catch (e) {
    console.error('Exception in getUserAdminCategories:', e);
    return [];
  }
};
