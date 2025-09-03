import { useState, useEffect } from 'react';
import { Home, Plus, FileText, User, ShieldAlert } from 'lucide-react';
import HomePage from './components/HomePage';
import ReportPage from './components/ReportPage';
import StatusPage from './components/StatusPage';
import ProfilePage from './components/ProfilePage';
import WelcomePage from './components/WelcomePage';
import AboutPage from './components/AboutPage';
import AdminPage from './components/AdminPage';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { translations } from './utils/translations';
import { getCurrentUser, signInWithGoogle } from './services/supabase.ts';

type Page = 'welcome' | 'home' | 'report' | 'status' | 'profile' | 'about' | 'admin';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const { theme, language } = useTheme();
  const t = translations[language];
  
  useEffect(() => {
    // Check if user is already signed in
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setIsSignedIn(true);
          setUser({
            name: currentUser.user_metadata?.full_name || 'User',
            email: currentUser.email,
            phone: currentUser.phone || '',
            joinedYear: new Date(currentUser.created_at).getFullYear().toString(),
            avatar: currentUser.user_metadata?.avatar_url || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
          });
          setCurrentPage('home');
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setAuthChecked(true);
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
        const { data, error } = await signInWithGoogle();
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

  const handleContinueAnonymously = () => {
    setCurrentPage('home');
  };

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

    switch (currentPage) {
      case 'welcome':
        return (
          <WelcomePage
            onSignIn={handleSignIn}
            onContinueAnonymously={handleContinueAnonymously}
          />
        );
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'report':
        return <ReportPage onNavigate={handleNavigate} cameraActive={cameraActive} userId={userId} />;
      case 'status':
        return <StatusPage onNavigate={handleNavigate} isSignedIn={true} userId={userId} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} user={user} onSignOut={handleSignOut} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage />;
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
              
              {/* Developer mode: Direct admin access */}
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
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;