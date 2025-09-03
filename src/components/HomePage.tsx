import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import CountUp from './CountUp';
import { AnimatedThemeToggler } from './ui/AnimatedThemeToggler';
import CameraButton from './ui/CameraButton';
import { getResolvedIssuesCount, getUserReports, ReportData } from '../services/ReportService';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

function HomePage({ onNavigate }: HomePageProps) {
  const { theme, language } = useTheme();
  const t = translations[language];
  
  const [resolvedIssuesCount, setResolvedIssuesCount] = useState<number>(0);
  const [userReports, setUserReports] = useState<ReportData[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Get user ID from localStorage
        let userId = localStorage.getItem('civicgo_anonymous_id');
        if (!userId) {
          userId = 'anon_' + Math.random().toString(36).substring(2, 15);
          localStorage.setItem('civicgo_anonymous_id', userId);
        }
        
        // Get resolved issues count
        const count = await getResolvedIssuesCount();
        console.log('HomePage: Resolved issues count:', count);
        setResolvedIssuesCount(count);
        
        // Get user reports
        const reports = await getUserReports(userId);
        setUserReports(reports);
        
        // Get recent updates (all reports sorted by updated_at)
        const allReports = await getUserReports();
        const updates = allReports
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 2); // Get only the 2 most recent updates
        
        setRecentUpdates(updates);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Set up an interval to refresh the resolved issues count every 10 seconds
    const refreshCounterInterval = setInterval(async () => {
      try {
        const count = await getResolvedIssuesCount();
        console.log('Refreshing resolved issues count:', count);
        setResolvedIssuesCount(count);
      } catch (error) {
        console.error('Error refreshing resolved count:', error);
      }
    }, 10000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshCounterInterval);
  }, []);
  
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
                  to={resolvedIssuesCount}
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
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : recentUpdates.length > 0 ? (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
            {recentUpdates.map(report => {
              // Calculate relative time
              const now = new Date();
              const updated = new Date(report.updated_at);
              const diffMs = now.getTime() - updated.getTime();
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffMinutes = Math.floor(diffMs / (1000 * 60));
              
              let timeText = '';
              if (diffDays > 0) {
                timeText = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
              } else if (diffHours > 0) {
                timeText = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
              } else if (diffMinutes > 0) {
                timeText = `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
              } else {
                timeText = 'Just now';
              }
              
              // Determine color based on status
              let bgColorClass = '';
              let statusColor = '';
              
              switch (report.status) {
                case 'Resolved':
                  bgColorClass = 'from-green-500/10 to-teal-500/10';
                  statusColor = 'bg-green-500';
                  break;
                case 'Forwarded':
                  bgColorClass = 'from-blue-500/10 to-indigo-500/10';
                  statusColor = 'bg-blue-500';
                  break;
                case 'In Review':
                  bgColorClass = 'from-yellow-500/10 to-amber-500/10';
                  statusColor = 'bg-yellow-500';
                  break;
                default:
                  bgColorClass = 'from-gray-500/10 to-slate-500/10';
                  statusColor = 'bg-gray-500';
              }
              
              return (
                <div 
                  key={report.report_id}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
                      : 'bg-white/40 backdrop-blur-md border-gray-100/50'
                  } p-5 rounded-xl shadow-lg border flex items-center justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all`}
                >
                  {/* Glass effect decorations */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${bgColorClass} opacity-30`}></div>
                  <div className={`absolute -inset-1 bg-gradient-to-r ${bgColorClass.replace('/10', '/20')} rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`}></div>
                  
                  <div className="relative">
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{report.title}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{report.status} • {timeText}</div>
                  </div>
                  <div className={`w-3 h-3 ${statusColor} rounded-full shadow-lg shadow-${statusColor}/30 relative z-10`}></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/40 border-gray-100/50'} border text-center`}>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>No recent updates</p>
          </div>
        )}
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
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : userReports.length > 0 ? (
          <div className="space-y-4">
            {userReports.slice(0, 2).map(report => {
              // Calculate relative time
              const now = new Date();
              const created = new Date(report.created_at);
              const diffMs = now.getTime() - created.getTime();
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              const diffWeeks = Math.floor(diffDays / 7);
              
              let timeText = '';
              if (diffWeeks > 0) {
                timeText = `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
              } else if (diffDays > 0) {
                timeText = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
              } else {
                timeText = 'Today';
              }
              
              // Determine colors based on status
              let fromColor = '';
              let toColor = '';
              let statusBgClass = '';
              let statusTextClass = '';
              
              switch (report.status) {
                case 'Resolved':
                  fromColor = 'from-green-500/10';
                  toColor = 'to-emerald-500/10';
                  statusBgClass = theme === 'dark' ? 'bg-green-900/80' : 'bg-green-100/80';
                  statusTextClass = theme === 'dark' ? 'text-green-200' : 'text-green-800';
                  break;
                case 'Forwarded':
                  fromColor = 'from-blue-500/10';
                  toColor = 'to-indigo-500/10';
                  statusBgClass = theme === 'dark' ? 'bg-blue-900/80' : 'bg-blue-100/80';
                  statusTextClass = theme === 'dark' ? 'text-blue-200' : 'text-blue-800';
                  break;
                case 'In Review':
                  fromColor = 'from-yellow-500/10';
                  toColor = 'to-amber-500/10';
                  statusBgClass = theme === 'dark' ? 'bg-yellow-900/80' : 'bg-yellow-100/80';
                  statusTextClass = theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800';
                  break;
                default:
                  fromColor = 'from-gray-500/10';
                  toColor = 'to-slate-500/10';
                  statusBgClass = theme === 'dark' ? 'bg-gray-900/80' : 'bg-gray-100/80';
                  statusTextClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
              }
              
              return (
                <div key={report.report_id} className={`${
                  theme === 'dark' 
                    ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
                    : 'bg-white/40 backdrop-blur-md border-gray-100/50'
                } p-5 rounded-xl shadow-lg border relative overflow-hidden group hover:shadow-xl hover:scale-[1.01] transition-all`}>
                  {/* Glass effect decorations */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${fromColor} ${toColor} opacity-30`}></div>
                  <div className={`absolute -inset-1 bg-gradient-to-r ${fromColor.replace('/10', '/20')} ${toColor.replace('/10', '/20')} rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`}></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{report.title}</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{timeText}</div>
                    </div>
                    <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {report.description.length > 100 
                        ? `${report.description.substring(0, 100)}...` 
                        : report.description}
                    </div>
                    <div className="mt-3 flex items-center flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBgClass} ${statusTextClass} backdrop-blur-sm shadow-sm`}>
                        {report.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        theme === 'dark' ? 'bg-purple-900/80 text-purple-200' : 'bg-purple-100/80 text-purple-800'
                      } backdrop-blur-sm shadow-sm`}>
                        {report.category}
                      </span>
                      {report.city && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          theme === 'dark' ? 'bg-teal-900/80 text-teal-200' : 'bg-teal-100/80 text-teal-800'
                        } backdrop-blur-sm shadow-sm`}>
                          {report.city}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-gray-400">#{report.report_id.substring(0, 4)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {userReports.length > 2 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => onNavigate('status')}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition-colors`}
                >
                  {t.seeAll} ({userReports.length})
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/40 border-gray-100/50'} border text-center`}>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>You haven't submitted any reports yet</p>
            <button 
              onClick={() => onNavigate('report')} 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
            >
              Create Your First Report
            </button>
          </div>
        )}
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  );
}

export default HomePage;