// This file handles OAuth redirects by checking for auth tokens in the URL
// and setting them in the browser's local storage

import { supabase } from './supabase';

/**
 * Checks if the current URL contains an authentication hash
 * and exchanges it for a session if it does
 */
export const handleOAuthRedirect = async () => {
  // Check if we have a hash in the URL (typically from OAuth redirect)
  if (window.location.hash && window.location.hash.includes('access_token')) {
    console.log('Detected authentication hash in URL. Handling OAuth redirect...');
    
    // Let Supabase Auth handle the hash
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error handling OAuth redirect:', error);
      return { success: false, error };
    }
    
    if (data?.session) {
      console.log('Successfully retrieved session from OAuth redirect');
      // Clean up the URL by removing the hash
      window.history.replaceState({}, document.title, window.location.pathname);
      return { success: true, session: data.session };
    }
  }
  
  return { success: false };
};

/**
 * Checks if there was a redirect from OAuth and handles the URL hash if needed
 * Then checks for an existing session
 */
export const initAuth = async () => {
  // First, handle any OAuth redirects if present
  const redirectResult = await handleOAuthRedirect();
  if (redirectResult.success) {
    return redirectResult.session;
  }
  
  // Otherwise, check if we have an existing session
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return data?.session || null;
};
