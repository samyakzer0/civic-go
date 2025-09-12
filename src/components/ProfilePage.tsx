import { useState, useEffect } from 'react';
import { Edit3, ChevronRight, LogOut, ShieldAlert } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations, languages } from '../utils/translations';
import { isAdmin, isCategoryAdmin } from '../services/supabase.ts';
import LanguageModal from './LanguageModal';
import ThemeModal from './ThemeModal';
import { ShinyButton } from './magicui/shiny-button';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  user: any;
  onSignOut: () => void;
}

function ProfilePage({ onNavigate, user, onSignOut }: ProfilePageProps) {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [hasCategoryAccess, setHasCategoryAccess] = useState(false);
  const { theme, language } = useTheme();
  const t = translations[language];
  
  useEffect(() => {
    // Check if user has admin privileges
    const checkAdminStatus = async () => {
      try {
        // Use the admin status passed from App.tsx if available
        if (user && user.isAdmin !== undefined) {
          setIsAdminUser(user.isAdmin);
        } else {
          // Fallback to checking directly
          const adminStatus = await isAdmin();
          setIsAdminUser(adminStatus);
        }
        
        // Check if user is an admin for any category
        const hasCategories = await isCategoryAdmin('Water'); // Check at least one category
        setHasCategoryAccess(hasCategories);
        
        console.log("Admin status check:", { isAdmin: user?.isAdmin || isAdminUser, hasCategories });
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  if (!user) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center px-6">
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>{t.signInRequired}</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
            {t.pleaseSignIn}
          </p>
          <button
            onClick={() => onNavigate('welcome')}
            className={`${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 px-6 rounded-xl font-semibold transition-colors`}
          >
            {t.signIn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 md:rounded-t-xl`}>
        <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} text-center`}>{t.profile}</h1>
      </div>

      <div className="p-6 pb-24">
        {/* Profile Info */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-sm border mb-6`}>
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <button className={`absolute bottom-0 right-0 ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white p-2 rounded-full transition-colors`}>
                <Edit3 size={16} />
              </button>
            </div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-1`}>{user.name}</h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Joined {user.joinedYear}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-sm border mb-6`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>{t.personalInformation}</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t.email}</span>
              <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'} font-medium`}>{user.email}</span>
            </div>
            
            <div className="flex items-center py-2">
              <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'} w-full text-center p-2 rounded-lg`}>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <span className="text-blue-500">Google</span> account connected
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-sm border mb-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t.notificationPreferences}</h3>
            
            <button 
              onClick={() => onNavigate('notification-preferences')}
              className={`text-sm ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
            >
              Manage
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t.pushNotifications}</span>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  pushNotifications 
                    ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600' 
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    pushNotifications ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t.emailNotifications}</span>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  emailNotifications 
                    ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600' 
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    emailNotifications ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <button
              onClick={() => onNavigate('notifications-history')}
              className={`w-full py-2 mt-2 text-center rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              } transition-colors`}
            >
              View Notification History
            </button>
            
          </div>
        </div>

        {/* App Settings */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-sm border mb-6`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>{t.appSettings}</h3>
          
          <div className="space-y-4">
            <button 
              onClick={() => setShowLanguageModal(true)}
              className="flex justify-between items-center w-full py-2 text-left"
            >
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t.language}</span>
              <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>{languages[language]}</span>
                <ChevronRight size={16} />
              </div>
            </button>
            
            <button 
              onClick={() => setShowThemeModal(true)}
              className="flex justify-between items-center w-full py-2 text-left"
            >
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t.theme}</span>
              <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                <ChevronRight size={16} />
              </div>
            </button>
            
            <button 
              onClick={() => onNavigate('about')}
              className="flex justify-between items-center w-full py-2 text-left"
            >
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t.aboutCivicGo}</span>
              <ChevronRight size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
            </button>
            
            {(isAdminUser || hasCategoryAccess) && (
              <button 
                onClick={() => onNavigate('admin')}
                className="flex justify-between items-center w-full py-2 text-left"
              >
                <span className={`flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <ShieldAlert size={16} className="mr-2 text-amber-500" />
                  Admin Panel
                </span>
                <ChevronRight size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <ShinyButton
          onClick={onSignOut}
          variant="danger"
          size="lg"
          className="w-full shadow-xl"
        >
          <LogOut size={20} />
          {t.logout}
        </ShinyButton>
      </div>

      {/* Language Modal */}
      <LanguageModal isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} />

      {/* Theme Modal */}
      <ThemeModal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} />
    </div>
  );
}

export default ProfilePage;