import { useEffect, useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import CountUp from './CountUp';
import { AnimatedThemeToggler } from './ui/AnimatedThemeToggler';
import CameraButton from './ui/CameraButton';
import { getUserReports, getRecentReports, ReportData } from '../services/ReportService';

interface HomePageProps {
  onNavigate: (page: string) => void;
  userId?: string;
}

function HomePage({ onNavigate, userId = 'anon_user' }: HomePageProps) {
  const { theme, language } = useTheme();
  const t = translations[language];
  
  // State for user reports and recent updates
  const [userReports, setUserReports] = useState<ReportData[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<ReportData[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(true);
  
  // Fetch user reports and recent updates
  useEffect(() => {
    fetchUserReports();
    fetchRecentUpdates();
  }, [userId]);
  
  const fetchUserReports = async () => {
    try {
      setIsLoadingReports(true);
      const reports = await getUserReports(userId);
      setUserReports(reports.slice(0, 3)); // Get up to 3 most recent reports
    } catch (error) {
      console.error('Error fetching user reports:', error);
    } finally {
      setIsLoadingReports(false);
    }
  };
  
  const fetchRecentUpdates = async () => {
    try {
      setIsLoadingUpdates(true);
      const updates = await getRecentReports(4); // Get up to 4 most recent updates
      setRecentUpdates(updates);
    } catch (error) {
      console.error('Error fetching recent updates:', error);
    } finally {
      setIsLoadingUpdates(false);
    }
  };
  
  // Helper to format the timestamp as "X time ago"
  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - updateTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} ${diffInSeconds === 1 ? 'second' : 'seconds'} ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };
  
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
        
        {isLoadingUpdates ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className={`animate-spin h-8 w-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        ) : recentUpdates.length === 0 ? (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No recent updates found
          </div>
        ) : (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
            {recentUpdates.slice(0, 4).map(update => {
              // Determine the color based on status
              let bgColorClass = '';
              let statusColor = '';
              
              switch (update.status) {
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
                  key={update.report_id}
                  onClick={() => onNavigate('status')}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
                      : 'bg-white/40 backdrop-blur-md border-gray-100/50'
                  } p-5 rounded-xl shadow-lg border flex items-center justify-between relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer`}
                >
                  {/* Glass effect decorations */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${bgColorClass} opacity-30`}></div>
                  <div className={`absolute -inset-1 bg-gradient-to-r ${bgColorClass.replace('/10', '/20')} rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`}></div>
                  
                  <div className="relative">
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {update.title.length > 30 ? update.title.substring(0, 30) + '...' : update.title}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {update.status} • {formatTimeAgo(update.updated_at)}
                      {update.city && <span className="block">{update.city}</span>}
                    </div>
                  </div>
                  <div className={`w-3 h-3 ${statusColor} rounded-full shadow-lg shadow-${statusColor}/30 relative z-10`}></div>
                </div>
              );
            })}
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
        
        {isLoadingReports ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className={`animate-spin h-8 w-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        ) : userReports.length === 0 ? (
          <div className="space-y-4">
            <div className={`${
              theme === 'dark' 
                ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
                : 'bg-white/40 backdrop-blur-md border-gray-100/50'
            } p-6 rounded-xl shadow-lg border relative overflow-hidden text-center`}>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                You haven't submitted any reports yet.
              </p>
              <button
                onClick={() => onNavigate('report')}
                className={`${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white py-2 px-4 rounded-lg transition-colors`}
              >
                Submit Your First Report
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {userReports.map(report => {
              // Determine the color based on status
              let bgColorClass = '';
              let statusClass = '';
              
              switch (report.status) {
                case 'Resolved':
                  bgColorClass = 'from-green-500/10 to-emerald-500/10';
                  statusClass = theme === 'dark' 
                    ? 'bg-green-900/80 text-green-200' 
                    : 'bg-green-100/80 text-green-800';
                  break;
                case 'Forwarded':
                  bgColorClass = 'from-blue-500/10 to-indigo-500/10';
                  statusClass = theme === 'dark' 
                    ? 'bg-blue-900/80 text-blue-200' 
                    : 'bg-blue-100/80 text-blue-800';
                  break;
                case 'In Review':
                  bgColorClass = 'from-yellow-500/10 to-amber-500/10';
                  statusClass = theme === 'dark' 
                    ? 'bg-yellow-900/80 text-yellow-200' 
                    : 'bg-yellow-100/80 text-yellow-800';
                  break;
                default:
                  bgColorClass = 'from-gray-500/10 to-blue-500/10';
                  statusClass = theme === 'dark' 
                    ? 'bg-gray-700/80 text-gray-200' 
                    : 'bg-gray-100/80 text-gray-800';
              }
              
              return (
                <div 
                  key={report.report_id}
                  onClick={() => onNavigate('status')}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
                      : 'bg-white/40 backdrop-blur-md border-gray-100/50'
                  } p-5 rounded-xl shadow-lg border relative overflow-hidden group hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer`}
                >
                  {/* Glass effect decorations */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${bgColorClass} opacity-30`}></div>
                  <div className={`absolute -inset-1 bg-gradient-to-r ${bgColorClass.replace('/10', '/20')} rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`}></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {report.title.length > 40 ? report.title.substring(0, 40) + '...' : report.title}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTimeAgo(report.created_at)}
                      </div>
                    </div>
                    <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {report.description.length > 80 ? report.description.substring(0, 80) + '...' : report.description}
                    </div>
                    <div className="mt-3 flex items-center flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass} backdrop-blur-sm shadow-sm`}>
                        {report.status}
                      </span>
                      {report.city && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {report.city}
                          </span>
                        </>
                      )}
                      <span className="text-gray-400">•</span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Ref: #{report.report_id}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  );
}

export default HomePage;