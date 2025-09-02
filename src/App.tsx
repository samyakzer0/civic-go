import { useState } from 'react';
import { Home, Plus, FileText, User } from 'lucide-react';
import HomePage from './components/HomePage';
import ReportPage from './components/ReportPage';
import StatusPage from './components/StatusPage';
import ProfilePage from './components/ProfilePage';
import WelcomePage from './components/WelcomePage';
import AboutPage from './components/AboutPage';
import AnimatedBackground from './components/ui/AnimatedBackground';
import WelcomeBackground from './components/ui/WelcomeBackground';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { translations } from './utils/translations';

type Page = 'welcome' | 'home' | 'report' | 'status' | 'profile' | 'about';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const { theme, language } = useTheme();
  const t = translations[language];

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

  const handleSignIn = (_provider: string) => {
    // Mock sign in
    setIsSignedIn(true);
    setUser({
      name: 'Sophia Carter',
      email: 'sophia.carter@email.com',
      phone: '+1 (555) 123-4567',
      joinedYear: '2021',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
    });
    setCurrentPage('home');
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
        return <ReportPage onNavigate={handleNavigate} cameraActive={cameraActive} />;
      case 'status':
        return <StatusPage onNavigate={handleNavigate} isSignedIn={isSignedIn} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} user={user} onSignOut={handleSignOut} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Removed unused showNavigation variable

  return (
    <>
      {currentPage === 'welcome' ? (
        // Welcome page with its own specialized background
        <WelcomeBackground>
          {renderPage()}
        </WelcomeBackground>
      ) : (
        // Other pages with animated background
        <AnimatedBackground>
          <div className={`w-full mx-auto min-h-screen relative max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl md:shadow-xl md:my-8 md:rounded-xl border border-opacity-50 ${
            theme === 'dark' 
              ? 'bg-gray-1200/30 backdrop-blur-sm border-gray-700/20' 
              : 'bg-white/10 backdrop-blur-sm border-gray-200/20'
          }`}>
            {renderPage()}
            
            <nav className={`fixed bottom-0 left-0 md:left-1/2 md:transform md:-translate-x-1/2 w-full md:max-w-2xl lg:max-w-4xl xl:max-w-6xl ${
              theme === 'dark' 
                ? 'bg-gray-900/40 border-gray-700/20' 
                : 'bg-white/40 border-gray-200/20'
            } border-t backdrop-blur-md shadow-lg`}>
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
              </div>
            </nav>
          </div>
        </AnimatedBackground>
      )}
    </>
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