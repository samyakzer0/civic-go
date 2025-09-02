import { Heart, Twitter, Settings } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col">
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
          <div className={`text-center md:text-left mb-8 md:mb-12 p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-900/30 border border-gray-700/30' 
              : 'bg-white/30 border border-gray-200/30'
            } backdrop-blur-sm shadow-lg`}>
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
              className={`w-full bg-gradient-to-r ${
                theme === 'dark' 
                  ? 'from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800' 
                  : 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              } text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl border ${
                theme === 'dark' ? 'border-blue-600/30' : 'border-indigo-500/30'
              }`}
            >
              <Heart size={24} />
              {t.signInWithGoogle}
            </button>
            
            <button
              onClick={() => onSignIn('twitter')}
              className={`w-full bg-gradient-to-r ${
                theme === 'dark' 
                  ? 'from-sky-700 to-blue-700 hover:from-sky-800 hover:to-blue-800' 
                  : 'from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700'
              } text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl border ${
                theme === 'dark' ? 'border-sky-600/30' : 'border-blue-500/30'
              }`}
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
                ? 'bg-gray-800/70 text-gray-200 border-gray-600/50 hover:bg-gray-700/70' 
                : 'bg-white/70 text-gray-700 border-gray-300/70 hover:bg-gray-50/70'} py-4 rounded-xl font-semibold text-lg border-2 transition-all backdrop-blur-sm hover:shadow-lg`}
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