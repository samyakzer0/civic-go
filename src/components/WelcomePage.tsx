
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ShinyButton } from './magicui/shiny-button';

interface WelcomePageProps {
  onSignIn: (provider: string) => void;
  onNavigate?: (page: string) => void;
}

function WelcomePage({ onSignIn, onNavigate }: WelcomePageProps) {
  const { theme, language } = useTheme();
  const t = translations[language];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gray-50'} flex flex-col`}>
      {/* Header */}
      <div className="text-center py-8 flex justify-center items-center px-6">
        <div className="flex items-center space-x-3">
            <img 
              src={theme === 'dark' ? "/assets/images/logo.png" : "/assets/images/logo2.png"} 
              alt="CivicGo Logo" 
              className="w-20 h-20 object-contain cursor-pointer hover:scale-105 transition-transform"
              onClick={() => {
                if (onNavigate) {
                  // Store the logo image for the report page
                  const logoSrc = theme === 'dark' ? "/assets/images/logo.png" : "/assets/images/logo2.png";
                  localStorage.setItem('capturedImage', logoSrc);
                  onNavigate('report');
                }
              }}
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className={`text-lg font-bold text-white hidden`}>CG</span>
          </div>
        
        </div>

      {/* Hero Illustration */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 max-w-6xl mx-auto">
        <div className="w-full max-w-md mb-8 md:mb-0 md:mr-8 md:w-1/2">
          <div className="w-full h-64 md:h-96 rounded-2xl shadow-lg overflow-hidden">
            <DotLottieReact
              src={theme === 'dark' 
                ? "https://lottie.host/ca2cf854-2b75-4fc5-8638-8ac8b9cc9c88/67uGha99NN.lottie"
                : "https://lottie.host/10a38492-0121-49e4-8d2a-f91263ea7e6f/CdeHlMBQuw.lottie"
              }
              loop
              autoplay
              className="w-full h-full"
            />
          </div>
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
            <ShinyButton
              onClick={() => onSignIn('google')}
              className={`w-full py-4 text-lg font-semibold bg-blue-600/10 hover:bg-blue-600/20 border-blue-500/30 hover:border-blue-500/50 text-blue-600 dark:text-blue-400 transition-all duration-300 ${theme === 'dark' ? 'hover:shadow-blue-500/20' : 'hover:shadow-blue-600/30'} hover:shadow-lg`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-3">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t.signInWithGoogle}
            </ShinyButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;