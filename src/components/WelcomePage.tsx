import { Twitter, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';

interface WelcomePageProps {
  onSignIn: (provider: string) => void;
  onContinueAnonymously: () => void;
}

function WelcomePage({ onSignIn, onContinueAnonymously }: WelcomePageProps) {
  const { theme, language } = useTheme();
  const t = translations[language];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-blue-50 to-green-50'} flex flex-col`}>
      {/* Header */}
      <div className="text-center py-8 flex justify-between items-center px-6">
        <div className="w-10"></div> {/* Empty div for centering */}
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>CivicGo</h1>
        <button 
          onClick={() => onSignIn('settings')} 
          className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Hero Illustration */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 max-w-6xl mx-auto">
        <div className="w-full max-w-md mb-8 md:mb-0 md:mr-8 md:w-1/2">
          <img 
            src="https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800" 
            alt="Community illustration" 
            className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
          />
        </div>

        <div className="md:w-1/2">
          <div className="text-center md:text-left mb-8 md:mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>
              {t.welcome}
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed px-4 md:px-0 md:pr-8`}>
              {t.welcomeToCity}
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="w-full space-y-4 px-4 md:px-0">
            <button
              onClick={() => onSignIn('google')}
              className={`w-full ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t.signInWithGoogle}
            </button>
            
            <button
              onClick={() => onSignIn('twitter')}
              className={`w-full ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg`}
            >
              <Twitter size={24} />
              {t.signInWithTwitter}
            </button>

            <div className="flex items-center my-6">
              <div className={`flex-1 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
              <span className={`px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{t.or}</span>
              <div className={`flex-1 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
            </div>

            <button
              onClick={onContinueAnonymously}
              className={`w-full ${theme === 'dark' 
                ? 'bg-gray-800 text-gray-200 border-gray-700 hover:border-gray-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'} py-4 rounded-xl font-semibold text-lg border-2 transition-colors`}
            >
              {t.continueAnonymously}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;