import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { initAuth } from '../services/auth-helper';

/**
 * A debug page for OAuth authentication issues
 * Shows current session, auth state, and provides buttons to test auth flow
 */
const AuthDebugPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  
  // Add log entry with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        addLog('Checking session...');
        const { data: { session } } = await supabase.auth.getSession();
        setSessionInfo(session);
        
        if (session) {
          addLog(`Session found. User: ${session.user.email}`);
        } else {
          addLog('No active session found');
        }
      } catch (error: any) {
        addLog(`Error checking session: ${error.message}`);
        setAuthError(error.message);
      }
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth event: ${event}`);
      setSessionInfo(session);
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  const handleInitAuth = async () => {
    try {
      addLog('Running initAuth()...');
      const session = await initAuth();
      
      if (session) {
        addLog(`Auth initialized successfully. User: ${session.user.email}`);
        setSessionInfo(session);
      } else {
        addLog('Auth initialized but no session found');
      }
    } catch (error: any) {
      addLog(`Error in initAuth: ${error.message}`);
      setAuthError(error.message);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      addLog('Starting Google sign-in...');
      
      // Get and log the current URL origin
      const currentOrigin = window.location.origin;
      addLog(`Current origin: ${currentOrigin}`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: currentOrigin,
        }
      });
      
      if (error) {
        addLog(`Google Sign-In Error: ${error.message}`);
        setAuthError(error.message);
        return;
      }
      
      if (data) {
        addLog(`Sign-in initiated. URL: ${data.url}`);
        // The redirect will happen automatically
      }
    } catch (error: any) {
      addLog(`Error during Google sign-in: ${error.message}`);
      setAuthError(error.message);
    }
  };
  
  const handleSignOut = async () => {
    try {
      addLog('Signing out...');
      await supabase.auth.signOut();
      addLog('Sign-out successful');
    } catch (error: any) {
      addLog(`Error during sign-out: ${error.message}`);
      setAuthError(error.message);
    }
  };
  
  const handleUrlHash = () => {
    addLog(`Current URL hash: ${window.location.hash}`);
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Auth Debug Page</h1>
        <button 
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to App
        </button>
      </div>
      
      {/* Current Session Info */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Current Session</h2>
        {sessionInfo ? (
          <div>
            <p><strong>User:</strong> {sessionInfo.user.email}</p>
            <p><strong>Provider:</strong> {sessionInfo.user.app_metadata?.provider || 'unknown'}</p>
            <p><strong>Expires:</strong> {new Date(sessionInfo.expires_at * 1000).toLocaleString()}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-500">View Raw Session Data</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <p className="text-orange-500">No active session</p>
        )}
        
        {authError && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
            <strong>Error:</strong> {authError}
          </div>
        )}
      </div>
      
      {/* Auth Actions */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Auth Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleGoogleSignIn}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign in with Google
          </button>
          
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
          
          <button 
            onClick={handleInitAuth}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Run initAuth()
          </button>
          
          <button 
            onClick={handleUrlHash}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Check URL Hash
          </button>
        </div>
      </div>
      
      {/* Debug Logs */}
      <div className="p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Debug Log</h2>
        <div className="max-h-60 overflow-y-auto p-2 bg-black text-green-400 font-mono text-xs">
          {debugLog.map((log, i) => (
            <div key={i} className="py-1">{log}</div>
          ))}
          {debugLog.length === 0 && <p>No logs yet</p>}
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPage;
