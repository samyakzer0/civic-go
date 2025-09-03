import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, MapPin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import { getUserReports, ReportData } from '../services/ReportService';

interface StatusPageProps {
  onNavigate: (page: string) => void;
  isSignedIn: boolean;
  userId?: string;
}

function StatusPage({ onNavigate, isSignedIn, userId = 'anon_user' }: StatusPageProps) {
  const { theme, language } = useTheme();
  const t = translations[language];
  
  const [reports, setReports] = useState<ReportData[]>([]);
  const [filter, setFilter] = useState<string | null>(null); // Filter by category
  const [isLoading, setIsLoading] = useState(true);
  
  // Categories for filtering
  const categories = ['All', 'Water', 'Electricity', 'Infrastructure', 'Roads', 'Sanitation', 'Others'];
  
  useEffect(() => {
    // Load user reports from local storage or API
    loadReports();
  }, [userId]);
  
  const loadReports = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, we would fetch from an API
      // For prototype, we're using the service that stores data in localStorage
      const userReports = await getUserReports(userId);
      console.log('Fetched reports:', userReports);
      
      // Sort reports by created date (newest first)
      const sortedReports = [...userReports].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setReports(sortedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredReports = filter && filter !== 'All' 
    ? reports.filter(report => report.category.toLowerCase() === filter.toLowerCase())
    : reports;
    
  // Format relative time (e.g., "2 hours ago")
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getStatusColor = (status: ReportData['status']) => {
    if (theme === 'dark') {
      switch (status) {
        case 'Resolved':
          return 'bg-green-900 text-green-200 border-green-800';
        case 'Forwarded':
          return 'bg-blue-900 text-blue-200 border-blue-800';
        case 'In Review':
          return 'bg-yellow-900 text-yellow-200 border-yellow-800';
        case 'Submitted':
          return 'bg-gray-700 text-gray-200 border-gray-600';
        default:
          return 'bg-gray-800 text-gray-200 border-gray-700';
      }
    } else {
      switch (status) {
        case 'Resolved':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'Forwarded':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'In Review':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Submitted':
          return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Water':
        return '💧';
      case 'Electricity':
        return '⚡';
      case 'Infrastructure':
        return '🏗️';
      case 'Roads':
        return '🛣️';
      case 'Sanitation':
        return '🧹';
      default:
        return '📌';
    }
  };

  if (!isSignedIn) {
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t.reportStatus}</h1>
        </div>
      </div>

      {/* Filter bar */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 border-b overflow-x-auto`}>
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilter(category === 'All' ? null : category)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                (filter === category || (category === 'All' && filter === null))
                  ? theme === 'dark'
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-600 text-white' 
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 pb-24 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>No reports yet.</p>
            <button
              onClick={() => onNavigate('report')}
              className={`mt-4 ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded-lg font-medium transition-colors`}
            >
              Submit Your First Report
            </button>
          </div>
        ) : (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
            {filteredReports.map((report) => (
              <div
                key={report.report_id}
                className={`${
                  theme === 'dark' 
                    ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
                    : 'bg-white/40 backdrop-blur-md border-gray-100/50'
                } p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all hover:scale-[1.02] relative overflow-hidden group`}
              >
                {/* Decorative elements for glass effect */}
                <div className={`absolute inset-0 ${
                  report.status === 'Resolved'
                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10'
                    : report.status === 'Forwarded'
                    ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10'
                    : report.status === 'In Review'
                    ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10'
                    : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
                } opacity-30`}></div>
                
                <div className={`absolute -inset-1 ${
                  report.status === 'Resolved'
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20'
                    : report.status === 'Forwarded'
                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20'
                    : report.status === 'In Review'
                    ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20'
                    : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
                } rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`}></div>
                
                <div className="relative">
                  {/* Reference ID */}
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
                    Ref: {report.report_id}
                  </div>
                  
                  {/* Title and Status */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex-1 flex items-center`}>
                      <span className="mr-2">{getCategoryIcon(report.category)}</span>
                      {report.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}
                    >
                      {report.status}
                    </span>
                  </div>
                  
                  {/* Location */}
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-2 flex items-center`}>
                    <MapPin size={14} className="inline mr-1" />
                    {report.location.address}
                  </div>
                  
                  {/* Last updated */}
                  <div className="flex justify-between items-center mt-4">
                    <div className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} text-sm`}>
                      Updated: {getRelativeTime(report.updated_at)}
                    </div>
                    
                    <button
                      onClick={() => console.log(`View details for ${report.report_id}`)}
                      className={`p-2 rounded-full ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusPage;