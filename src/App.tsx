import { useState, useEffect } from 'react';
import { Home, Plus, FileText, User, ShieldAlert } from 'lucide-react';
import HomePage from './components/HomePage';
import ReportPage from './components/ReportPage';
import StatusPage from './components/StatusPage';
import ProfilePage from './components/ProfilePage';
import WelcomePage from './components/WelcomePage';
import AboutPage from './components/AboutPage';
import AdminPage from './components/AdminPage';
import NotificationsPage from './components/NotificationsPage';
import NotificationsHistoryPage from './components/NotificationsHistoryPage';
import NotificationPreferencesPage from './components/NotificationPreferencesPage';
import GeocodingTest from './components/GeocodingTest';
import NotificationCenter from './components/NotificationCenter';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { translations } from './utils/translations';
import { getCurrentUser, signInWithGoogle, isAdmin } from './services/supabase.ts';
// Import firebase services
import { initializeFirebaseMessaging, requestNotificationPermissionOnGesture, onForegroundMessage } from './services/firebase';
import { updateUserIdInReports } from './services/ReportService';
import { updateUserIdInNotifications } from './services/EnhancedNotificationService';

type Page = 'welcome' | 'home' | 'report' | 'status' | 'profile' | 'about' | 'admin' | 'notifications' | 'notifications-history' | 'notification-preferences' | 'geocoding-test';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const { theme, language } = useTheme();
  const t = translations[language];
  
  useEffect(() => {
    // Check if user is already signed in
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setIsSignedIn(true);
          
          // Check if the user is an admin
          const adminStatus = await isAdmin();
          console.log('User admin status:', adminStatus);
          
          setUser({
            name: currentUser.user_metadata?.full_name || 'User',
            email: currentUser.email,
            phone: currentUser.phone || '',
            joinedYear: new Date(currentUser.created_at).getFullYear().toString(),
            avatar: currentUser.user_metadata?.avatar_url || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
            isAdmin: adminStatus
          });
          setCurrentPage('home');
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };
    
    checkAuth();
  }, []);

  const handleNavigate = (page: string) => {
    // Check if page contains parameters
    if (page.includes('?')) {
      const [basePage, params] = page.split('?');
      const cameraActive = params.includes('camera=true');
      setCurrentPage(basePage as Page);
      
      // If navigating to report with camera=true, set cameraActive
      if (basePage === 'report' && cameraActive) {
        setCameraActive(true);
      }
    } else {
      setCurrentPage(page as Page);
      setCameraActive(false);
    }
  };

  const handleSignIn = async (provider: string) => {
    if (provider === 'google') {
      try {
        const { error } = await signInWithGoogle();
        if (error) {
          console.error("Google Sign-In Error:", error);
          return;
        }
        
        // Auth will redirect to the OAuth provider, so we don't need to do anything else here
        // The user will be authenticated when they return to the page
      } catch (error) {
        console.error("Error during Google sign in:", error);
      }
    } else if (provider === 'settings') {
      // Handle settings navigation
      // This is used in the welcome page settings button
    } else {
      // Fallback to mock sign in for other providers or testing
      setIsSignedIn(true);
      setUser({
        name: 'Sophia Carter',
        email: 'sophia.carter@email.com',
        phone: '+1 (555) 123-4567',
        joinedYear: '2021',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
      });
      setCurrentPage('home');
    }
  };

  // Anonymous login has been removed as requested

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUser(null);
    setCurrentPage('welcome');
  };

  const renderPage = () => {
    // Generate a unique ID for anonymous users and store it in localStorage
    const getUserId = () => {
      if (isSignedIn && user) {
        return user.email; // Use email as ID for signed in users
      }
      
      // For anonymous users, generate a persistent ID
      let anonymousId = localStorage.getItem('civicgo_anonymous_id');
      if (!anonymousId) {
        anonymousId = 'anon_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('civicgo_anonymous_id', anonymousId);
      }
      return anonymousId;
    };

    const userId = getUserId();

    // Security check - redirect to home if trying to access admin page without admin privileges
    if (currentPage === 'admin' && !user?.isAdmin) {
      console.warn('Unauthorized access attempt to admin page');
      // Redirect to home page if not admin
      setTimeout(() => setCurrentPage('home'), 0);
      return <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p>You don't have permission to access the admin panel.</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setCurrentPage('home')}
          >
            Return to Home
          </button>
        </div>
      </div>;
    }

    switch (currentPage) {
      case 'welcome':
        return (
          <WelcomePage
            onSignIn={handleSignIn}
          />
        );
      case 'home':
        return <HomePage onNavigate={handleNavigate} userId={userId} />;
      case 'report':
        return <ReportPage onNavigate={handleNavigate} cameraActive={cameraActive} userId={userId} />;
      case 'status':
        return <StatusPage onNavigate={handleNavigate} isSignedIn={true} userId={userId} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} user={user} onSignOut={handleSignOut} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} user={user} />; // Pass user to AdminPage
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} userId={userId} />;
      case 'notifications-history':
        return <NotificationsHistoryPage onNavigate={handleNavigate} userId={userId} />;
      case 'notification-preferences':
        return <NotificationPreferencesPage onNavigate={handleNavigate} userId={userId} />;
      case 'geocoding-test':
        return <GeocodingTest />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  const showNavigation = currentPage !== 'welcome';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full mx-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} min-h-screen relative max-w-full sm:max-w-full md:max-w-2xl lg:max-w-4xl xl:max-w-6xl md:shadow-xl md:my-8 md:rounded-t-xl md:rounded-b-xl overflow-hidden`}>
        {renderPage()}
        
        {showNavigation && (
          <nav className={`fixed bottom-0 left-0 md:left-1/2 md:transform md:-translate-x-1/2 w-full md:max-w-2xl lg:max-w-4xl xl:max-w-6xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
            <div className="flex justify-around py-2">
              <button
                onClick={() => setCurrentPage('home')}
                className={`flex flex-col items-center py-2 px-4 transition-colors ${
                  currentPage === 'home' 
                    ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600' 
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <Home size={24} />
                <span className="text-xs mt-1">{t.home}</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('report')}
                className={`flex flex-col items-center py-2 px-4 transition-colors ${
                  currentPage === 'report' 
                    ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600' 
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <Plus size={24} />
                <span className="text-xs mt-1">{t.report}</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('status')}
                className={`flex flex-col items-center py-2 px-4 transition-colors ${
                  currentPage === 'status' 
                    ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600' 
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <FileText size={24} />
                <span className="text-xs mt-1">{t.status}</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('profile')}
                className={`flex flex-col items-center py-2 px-4 transition-colors ${
                  currentPage === 'profile' 
                    ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600' 
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <User size={24} />
                <span className="text-xs mt-1">{t.profile}</span>
              </button>
              
              {/* Admin panel - only visible to admins */}
              {user?.isAdmin && (
                <button
                  onClick={() => setCurrentPage('admin')}
                  className={`flex flex-col items-center py-2 px-1 transition-colors ${
                    currentPage === 'admin' 
                      ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600' 
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <ShieldAlert size={24} />
                  <span className="text-xs mt-1">Admin</span>
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

function App() {
  const [userId, setUserId] = useState<string>(() => {
    // Get user ID from localStorage if available
    const storedId = localStorage.getItem('civicgo_anonymous_id');
    return storedId || 'anon_default';
  });
  
  useEffect(() => {
    // Update userId when user signs in and initialize Firebase notifications
    const setupUser = async () => {
      try {
        // Check if user is authenticated
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.email) {
          const userEmail = currentUser.email;
          setUserId(userEmail);
          
          // Update user_id in reports from anonymous ID to email
          const anonymousId = localStorage.getItem('civicgo_anonymous_id');
          if (anonymousId && anonymousId !== userEmail) {
            await updateUserIdInReports(anonymousId, userEmail);
            await updateUserIdInNotifications(anonymousId, userEmail);
          }
          
          // Initialize Firebase notifications
          console.log("User authenticated:", userEmail);
          
          // Initialize Firebase messaging
          await initializeFirebaseMessaging();
          // Removed automatic permission request - will be handled on user gesture
          onForegroundMessage(userEmail);
        }
      } catch (error) {
        console.error("Error setting up user and notifications:", error);
      }
    };
    
    setupUser();
  }, []);

  const handleRequestNotifications = async () => {
    const token = await requestNotificationPermissionOnGesture();
    if (token) {
      console.log('Notifications enabled');
      // You can show a success message or update UI here
    } else {
      console.log('Notifications denied');
      // You can show a message or handle denial here
    }
  };
  
  return (
    <ThemeProvider>
      <NotificationProvider userId={userId}>
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;