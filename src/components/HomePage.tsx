import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import CountUp from './CountUp';
import { AnimatedThemeToggler } from './ui/AnimatedThemeToggler';
import CameraButton from './ui/CameraButton';
import NotificationIcon from './ui/NotificationIcon';
import { getUserReports, getRecentReports, ReportData, getThumbnailUrl } from '../services/ReportService';
import { getCommunityStats, CommunityStats } from '../services/AnalyticsService';
import IssueHeatMap from './IssueHeatMap';
import AnimatedBackground from './AnimatedBackground';
import Loader from './Loader';

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
  
  // State for community statistics
  const [communityStats, setCommunityStats] = useState<CommunityStats>({
    totalReports: 0,
    resolvedReports: 0,
    activeReports: 0,
    avgResponseTime: 2.3,
    resolutionRate: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Fetch user reports and recent updates
  useEffect(() => {
    fetchUserReports();
    fetchRecentUpdates();
    fetchCommunityStats();
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
  
  const fetchCommunityStats = async () => {
    try {
      setIsLoadingStats(true);
      const stats = await getCommunityStats();
      setCommunityStats(stats);
    } catch (error) {
      console.error('Error fetching community stats:', error);
    } finally {
      setIsLoadingStats(false);
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
        : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          
            <img 
              src={theme === 'dark' ? "/assets/images/logo.png" : "/assets/images/logo2.png"} 
              alt="CivicGo Logo" 
              className="w-20 h-20 object-contain cursor-pointer hover:scale-105 transition-transform"
              onClick={() => {
                // Store the logo image for the report page
                const logoSrc = theme === 'dark' ? "/assets/images/logo.png" : "/assets/images/logo2.png";
                localStorage.setItem('capturedImage', logoSrc);
                onNavigate('report');
              }}
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className={`text-sm font-bold text-white hidden`}>CG</span>
          </div>
        <div className="flex items-center space-x-3">
          <CameraButton onNavigate={onNavigate} />
          <AnimatedThemeToggler />
          <NotificationIcon userId={userId} onNavigate={onNavigate} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 pt-8 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Main CTA Card */}
          <div className={`${
            theme === 'dark'
              ? 'bg-gray-800/90'
              : 'bg-white/95'
          } backdrop-blur-xl rounded-3xl p-8 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          } relative overflow-hidden border ${
            theme === 'dark' ? 'border-gray-700/40' : 'border-gray-200/50'
          } shadow-2xl hover:shadow-3xl transition-all duration-500 group`}>
            {/* Animated Background - Only LottieFile Animation */}
            <AnimatedBackground
              intensity="medium"
              className="pointer-events-none"
            />
            
            <div className="relative z-10">
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white/90' : 'text-gray-700'
                  }`}>Platform Active</span>
                </div>
                
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 leading-tight ${
                  theme === 'dark' 
                    ? 'bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90' 
                    : 'text-gray-900'
                }`}>
                  {t.makeYourVoiceHeard}
                </h2>
                <p className={`text-lg opacity-90 mb-8 leading-relaxed ${
                  theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Join thousands making a difference in their communities
                </p>
              </div>
              
              <button
                onClick={() => onNavigate('report')}
                className={`${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } backdrop-blur-sm py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg w-full md:w-auto hover:shadow-xl hover:scale-[1.02] group-hover:scale-[1.05] transform`}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>{t.reportNewIssue}</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Stats Preview Card */}
          <div className={`${
            theme === 'dark' 
              ? 'bg-gray-800/60 backdrop-blur-xl border-gray-700/50' 
              : 'bg-white/60 backdrop-blur-xl border-gray-100/50'
          } rounded-3xl p-8 shadow-xl border hover:shadow-2xl transition-all duration-500 relative overflow-hidden group`}>
            {/* Glass effect decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-60"></div>
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Live Impact
                </h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Real-time</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      {isLoadingStats ? (
                        <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
                      ) : (
                        <CountUp from={0} to={communityStats.resolvedReports} duration={2} />
                      )}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Issues Resolved</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                      {isLoadingStats ? (
                        <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
                      ) : (
                        <CountUp from={0} to={communityStats.totalReports} duration={2} />
                      )}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Reports</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      {isLoadingStats ? (
                        <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
                      ) : (
                        <span className="flex items-baseline">
                          <CountUp from={0} to={communityStats.avgResponseTime} duration={2} />
                          <span className="ml-1 text-lg">d</span>
                        </span>
                      )}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Avg Response</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                      {isLoadingStats ? (
                        <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
                      ) : (
                        <span className="flex items-baseline">
                          <CountUp from={0} to={communityStats.resolutionRate} duration={2} />
                          <span className="ml-1 text-lg">%</span>
                        </span>
                      )}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 max-w-4xl mx-auto">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>{t.recentUpdates}</h3>
        
        {isLoadingUpdates ? (
          <div className="flex justify-center items-center py-8">
            <Loader size="small" message="Loading recent updates..." />
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
                  
                  <div className="relative flex items-center space-x-4">
                    {/* Report Image */}
                    {update.image_url && getThumbnailUrl(update.image_url, 48) && (
                      <div className="flex-shrink-0">
                        <img
                          src={getThumbnailUrl(update.image_url, 48)}
                          alt="Report"
                          className="w-12 h-12 object-cover rounded-lg border-2 border-white/20 cursor-pointer hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent onClick
                            localStorage.setItem('capturedImage', update.image_url);
                            onNavigate('report');
                          }}
                          onError={(e) => {
                            // Hide broken images
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {update.title.length > 30 ? update.title.substring(0, 30) + '...' : update.title}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {update.status} • {formatTimeAgo(update.updated_at)}
                        {update.city && <span className="block">{update.city}</span>}
                      </div>
                    </div>
                  </div>
                  <div className={`w-3 h-3 ${statusColor} rounded-full shadow-lg shadow-${statusColor}/30 relative z-10`}></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Issue Heat Map */}
      <div className="p-6 max-w-4xl mx-auto">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>Issue Hotspots</h3>
        <IssueHeatMap />
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
            <Loader size="small" message="Loading your reports..." />
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
                  
                  <div className="relative flex items-start space-x-4">
                    {/* Report Image */}
                    {report.image_url && getThumbnailUrl(report.image_url, 64) && (
                      <div className="flex-shrink-0">
                        <img
                          src={getThumbnailUrl(report.image_url, 64)}
                          alt="Report"
                          className="w-16 h-16 object-cover rounded-lg border-2 border-white/20 cursor-pointer hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent onClick
                            localStorage.setItem('capturedImage', report.image_url);
                            onNavigate('report');
                          }}
                          onError={(e) => {
                            // Hide broken images
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
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