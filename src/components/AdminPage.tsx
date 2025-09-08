import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUser, isAdmin } from '../services/supabase.ts';
import { useTheme } from '../contexts/ThemeContext';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminSetupInstructions from './admin/AdminSetupInstructions';
import Loader from './Loader';

interface AdminPageProps {
  onNavigate?: (page: string) => void;
  user?: any; // Add user prop
}

function AdminPage({ onNavigate, user }: AdminPageProps) {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);

  useEffect(() => {
    // If user prop is provided, use it instead of making additional API calls
    if (user) {
      setIsAuthenticated(true);
      setIsUserAdmin(user.isAdmin);
      setIsLoading(false);
    } else {
      // Fallback to checking auth status if user prop is not provided
      checkAuthStatus();
    }
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      
      if (user) {
        setIsAuthenticated(true);
        
        try {
          // Check if the user is an admin
          const adminStatus = await isAdmin();
          setIsUserAdmin(adminStatus);
          
          // If user is not an admin, redirect to home
          if (!adminStatus && onNavigate) {
            console.warn('Non-admin user attempted to access admin panel');
            onNavigate('home');
          }
        } catch (error: any) {
          console.error('Error checking admin status:', error);
          
          // Check for specific error codes
          if (error.status === 406 || error.code === '406') {
            setErrorStatus(406);
            setShowSetupInstructions(true);
          } else {
            // For other errors, redirect to home
            if (onNavigate) {
              onNavigate('home');
            }
          }
        }
      } else {
        setIsAuthenticated(false);
        if (onNavigate) {
          onNavigate('home');
        }
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      setIsAuthenticated(false);
      setIsUserAdmin(false);
      
      // On error, redirect to home
      if (onNavigate) {
        onNavigate('home');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    checkAuthStatus();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };
  
  const handleSetupComplete = () => {
    setShowSetupInstructions(false);
    checkAuthStatus();
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader size="medium" message="Loading admin panel..." />
      </div>
    );
  }
  
  // Show setup instructions if needed
  if (showSetupInstructions) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 md:rounded-t-xl`}>
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToHome}
              className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Admin Setup</h1>
          </div>
        </div>
        
        <AdminSetupInstructions onComplete={handleSetupComplete} />
      </div>
    );
  }

  if (!isAuthenticated || !isUserAdmin) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 md:rounded-t-xl`}>
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToHome}
              className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Admin Panel</h1>
          </div>
        </div>
        
        <div className="p-6 flex flex-col items-center justify-center">
          <AdminLogin onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard onLogout={handleLogout} onNavigate={handleBackToHome} user={user} />
  );
}

export default AdminPage;
