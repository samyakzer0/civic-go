import React, { useState } from 'react';
import { Home, Plus, FileText, User, Settings } from 'lucide-react';
import HomePage from './components/HomePage';
import ReportPage from './components/ReportPage';
import StatusPage from './components/StatusPage';
import ProfilePage from './components/ProfilePage';
import WelcomePage from './components/WelcomePage';

type Page = 'welcome' | 'home' | 'report' | 'status' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleSignIn = (provider: string) => {
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
        return <HomePage onNavigate={setCurrentPage} />;
      case 'report':
        return <ReportPage onNavigate={setCurrentPage} />;
      case 'status':
        return <StatusPage onNavigate={setCurrentPage} isSignedIn={isSignedIn} />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} user={user} onSignOut={handleSignOut} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  const showNavigation = currentPage !== 'welcome';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {renderPage()}
        
        {showNavigation && (
          <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
            <div className="flex justify-around py-2">
              <button
                onClick={() => setCurrentPage('home')}
                className={`flex flex-col items-center py-2 px-4 transition-colors ${
                  currentPage === 'home' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Home size={24} />
                <span className="text-xs mt-1">Home</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('report')}
                className={`flex flex-col items-center py-2 px-4 transition-colors ${
                  currentPage === 'report' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Plus size={24} />
                <span className="text-xs mt-1">Report</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('status')}
                className={`flex flex-col items-center py-2 px-4 transition-colors ${
                  currentPage === 'status' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <FileText size={24} />
                <span className="text-xs mt-1">Status</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('profile')}
                className={`flex flex-col items-center py-2 px-4 transition-colors ${
                  currentPage === 'profile' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <User size={24} />
                <span className="text-xs mt-1">Profile</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

export default App;