import { Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import CountUp from './CountUp';
import { AnimatedThemeToggler } from './ui/AnimatedThemeToggler';
import CameraButton from './ui/CameraButton';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

function HomePage({ onNavigate }: HomePageProps) {
  const { theme, language } = useTheme();
  const t = translations[language];
  
  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-b from-amber-50 via-green-50 to-blue-50'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>CivicGo</h1>
        <div className="flex items-center space-x-2">
          <CameraButton onNavigate={onNavigate} />
          <AnimatedThemeToggler />
          <button 
            onClick={() => onNavigate('profile')}
            className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 pt-8 max-w-4xl mx-auto">
        <div className={`${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-blue-800/80 to-green-800/80' 
            : 'bg-gradient-to-r from-green-400/90 to-blue-500/90'
        } backdrop-blur-lg rounded-3xl p-8 text-white relative overflow-hidden border ${
          theme === 'dark' ? 'border-gray-700/40' : 'border-white/20'
        } shadow-2xl`}>
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
          
          <div className="relative z-10 md:max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {t.makeYourVoiceHeard}
            </h2>
            <p className="text-lg opacity-90 mb-8 leading-relaxed">
              {t.welcomeToCity}
            </p>
            
            <button
              onClick={() => onNavigate('report')}
              className={`${
                theme === 'dark' 
                  ? 'bg-white/90 text-blue-800 hover:bg-white' 
                  : 'bg-white/90 text-blue-600 hover:bg-white'
              } backdrop-blur-sm py-4 px-8 rounded-xl font-semibold text-lg transition-all shadow-lg w-full md:w-auto hover:shadow-xl hover:scale-[1.02]`}
            >
              {t.reportNewIssue}
            </button>
          </div>
          
          {/* Background decoration with enhanced glass effect */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/20 backdrop-blur-lg rounded-full -translate-y-12 translate-x-12 border border-white/10"></div>
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/20 backdrop-blur-lg rounded-full translate-y-12 -translate-x-12 border border-white/10"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full -translate-y-1/2 -translate-x-1/2 border border-white/5"></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 mt-8 max-w-4xl mx-auto">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>{t.communityImpact}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className={`${
            theme === 'dark' 
              ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
              : 'bg-white/40 backdrop-blur-md border-gray-100/50'
          } p-6 rounded-xl shadow-lg border relative overflow-hidden group hover:scale-105 transition-transform`}>
            {/* Decorative elements for glass effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-30"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
            
            <div className="relative">
              <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mb-1`}>
                <CountUp 
                  from={0}
                  to={347}
                  separator=","
                  duration={1.5}
                  className="count-up-text"
                />
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t.issuesResolved}</div>
            </div>
          </div>
          
          <div className={`${
            theme === 'dark' 
              ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
              : 'bg-white/40 backdrop-blur-md border-gray-100/50'
          } p-6 rounded-xl shadow-lg border relative overflow-hidden group hover:scale-105 transition-transform`}>
            {/* Decorative elements for glass effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 opacity-30"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-teal-500/30 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
            
            <div className="relative">
              <div className={`text-3xl font-bold flex items-baseline ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} mb-1`}>
                <CountUp 
                  from={0}
                  to={2.3}
                  duration={1.5}
                  className="count-up-text"
                />
                <span className="ml-1 text-lg">d</span>
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t.avgResponseTime}</div>
            </div>
          </div>
          
          <div className="hidden md:block"></div>
          <div className="hidden md:block"></div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 max-w-4xl mx-auto">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>{t.recentUpdates}</h3>
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
          <div className={`${
            theme === 'dark' 
              ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
              : 'bg-white/40 backdrop-blur-md border-gray-100/50'
          } p-5 rounded-xl shadow-lg border flex items-center justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all`}>
            {/* Glass effect decorations */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 opacity-30"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            <div className="relative">
              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Pothole on Main St</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Resolved • 2 hours ago</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/30 relative z-10"></div>
          </div>
          
          <div className={`${
            theme === 'dark' 
              ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
              : 'bg-white/40 backdrop-blur-md border-gray-100/50'
          } p-5 rounded-xl shadow-lg border flex items-center justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all`}>
            {/* Glass effect decorations */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 opacity-30"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            <div className="relative">
              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Streetlight Outage</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>In Review • 1 day ago</div>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/30 relative z-10"></div>
          </div>
        </div>
      </div>

      {/* Your Reports */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t.yourReports}</h3>
          <button 
            onClick={() => onNavigate('status')}
            className="text-sm text-blue-500 hover:text-blue-600 hover:underline transition-colors"
          >
            {t.seeAll}
          </button>
        </div>
        <div className="space-y-4">
          <div className={`${
            theme === 'dark' 
              ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
              : 'bg-white/40 backdrop-blur-md border-gray-100/50'
          } p-5 rounded-xl shadow-lg border relative overflow-hidden group hover:shadow-xl hover:scale-[1.01] transition-all`}>
            {/* Glass effect decorations */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-30"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Tree Fallen After Storm</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>3 days ago</div>
              </div>
              <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Large tree blocking sidewalk on Park Avenue.
              </div>
              <div className="mt-3 flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  theme === 'dark' 
                    ? 'bg-blue-900/80 text-blue-200' 
                    : 'bg-blue-100/80 text-blue-800'
                } backdrop-blur-sm shadow-sm`}>
                  In Progress
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ref: #2468</span>
              </div>
            </div>
          </div>

          <div className={`${
            theme === 'dark' 
              ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
              : 'bg-white/40 backdrop-blur-md border-gray-100/50'
          } p-5 rounded-xl shadow-lg border relative overflow-hidden group hover:shadow-xl hover:scale-[1.01] transition-all`}>
            {/* Glass effect decorations */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-30"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Graffiti on Public Building</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>1 week ago</div>
              </div>
              <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Inappropriate graffiti on the east wall of community center.
              </div>
              <div className="mt-3 flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  theme === 'dark' 
                    ? 'bg-green-900/80 text-green-200' 
                    : 'bg-green-100/80 text-green-800'
                } backdrop-blur-sm shadow-sm`}>
                  Completed
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ref: #2201</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  );
}

export default HomePage;