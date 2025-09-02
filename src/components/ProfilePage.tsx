import { useState } from 'react';
import { Edit3, ChevronRight, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations, languages } from '../utils/translations';
import LanguageModal from './LanguageModal';
import ThemeModal from './ThemeModal';

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
  const { theme, language } = useTheme();
  const t = translations[language];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen">
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
        <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} text-center`}>{t.profile}</h1>
      </div>

      <div className="p-6 pb-24">
        {/* Profile Info */}
        <div className={`${
          theme === 'dark' 
            ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
            : 'bg-white/40 backdrop-blur-md border-gray-100/50'
        } rounded-xl p-6 shadow-lg border mb-6 relative overflow-hidden group hover:shadow-xl transition-all`}>
          {/* Glass effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-30"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="absolute -inset-1 opacity-0 group-hover:opacity-40 group-hover:animate-shimmer bg-[length:500%_100%] bg-gradient-to-r from-transparent via-white to-transparent transition-opacity"></div>
          
          <div className="flex flex-col items-center text-center relative">
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
        <div className={`${
          theme === 'dark' 
            ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
            : 'bg-white/40 backdrop-blur-md border-gray-100/50'
        } rounded-xl p-6 shadow-lg border mb-6 relative overflow-hidden group hover:shadow-xl transition-all`}>
          {/* Glass effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-30"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="absolute -inset-1 opacity-0 group-hover:opacity-40 group-hover:animate-shimmer bg-[length:500%_100%] bg-gradient-to-r from-transparent via-white to-transparent transition-opacity"></div>
          
          <div className="relative">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>{t.personalInformation}</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t.email}</span>
                <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'} font-medium`}>{user.email}</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t.phone}</span>
                <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'} font-medium`}>{user.phone}</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t.password}</span>
                <button className={`${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}>
                  {t.change}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className={`${
          theme === 'dark' 
            ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
            : 'bg-white/40 backdrop-blur-md border-gray-100/50'
        } rounded-xl p-6 shadow-lg border mb-6 relative overflow-hidden group hover:shadow-xl transition-all`}>
          {/* Glass effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5 opacity-30"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="absolute -inset-1 opacity-0 group-hover:opacity-40 group-hover:animate-shimmer bg-[length:500%_100%] bg-gradient-to-r from-transparent via-white to-transparent transition-opacity"></div>
          
          <div className="relative">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>{t.notificationPreferences}</h3>
          
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
          </div>
          </div>
        </div>

        {/* App Settings */}
        <div className={`${
          theme === 'dark' 
            ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
            : 'bg-white/40 backdrop-blur-md border-gray-100/50'
        } rounded-xl p-6 shadow-lg border mb-6 relative overflow-hidden group hover:shadow-xl transition-all`}>
          {/* Glass effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-30"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="absolute -inset-1 opacity-0 group-hover:opacity-40 group-hover:animate-shimmer bg-[length:500%_100%] bg-gradient-to-r from-transparent via-white to-transparent transition-opacity"></div>
          
          <div className="relative">
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
          </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="relative overflow-hidden group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <button
            onClick={onSignOut}
            className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all shadow-lg flex items-center justify-center gap-3 relative z-10"
          >
            <LogOut size={20} />
            {t.logout}
          </button>
        </div>
      </div>

      {/* Language Modal */}
      <LanguageModal isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} />

      {/* Theme Modal */}
      <ThemeModal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} />
    </div>
  );
}

export default ProfilePage;