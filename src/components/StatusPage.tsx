import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';

interface StatusPageProps {
  onNavigate: (page: string) => void;
  isSignedIn: boolean;
}

interface Report {
  id: string;
  title: string;
  location: string;
  status: 'Submitted' | 'In Review' | 'Forwarded' | 'Resolved';
  lastUpdated: string;
}

function StatusPage({ onNavigate, isSignedIn }: StatusPageProps) {
  const { theme, language } = useTheme();
  const t = translations[language];
  
  const reports: Report[] = [
    {
      id: '1',
      title: 'Pothole on Main Street',
      location: '123 Main St, Anytown',
      status: 'Resolved',
      lastUpdated: '2 hours ago'
    },
    {
      id: '2',
      title: 'Streetlight Outage',
      location: '456 Oak Ave, Anytown',
      status: 'Forwarded',
      lastUpdated: '1 day ago'
    },
    {
      id: '3',
      title: 'Graffiti on Building',
      location: '789 Pine Ln, Anytown',
      status: 'In Review',
      lastUpdated: '3 days ago'
    },
    {
      id: '4',
      title: 'Damaged Sidewalk',
      location: '101 Elm Rd, Anytown',
      status: 'Submitted',
      lastUpdated: '5 days ago'
    }
  ];

  const getStatusColor = (status: Report['status']) => {
    if (theme === 'dark') {
      switch (status) {
        case 'Resolved':
          return 'bg-green-900 text-green-200 border-green-800';
        case 'Forwarded':
          return 'bg-green-900 text-green-200 border-green-800';
        case 'In Review':
          return 'bg-yellow-900 text-yellow-200 border-yellow-800';
        case 'Submitted':
          return 'bg-blue-900 text-blue-200 border-blue-800';
        default:
          return 'bg-gray-800 text-gray-200 border-gray-700';
      }
    } else {
      switch (status) {
        case 'Resolved':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'Forwarded':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'In Review':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Submitted':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  if (!isSignedIn) {
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className={`p-2 -ml-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t.reportStatus}</h1>
        </div>
      </div>

      <div className="p-6 pb-24 max-w-4xl mx-auto">
        {reports.length === 0 ? (
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
            {reports.map((report) => (
              <div
                key={report.id}
                className={`${
                  theme === 'dark' 
                    ? 'bg-gray-800/40 backdrop-blur-md border-gray-700/50' 
                    : 'bg-white/40 backdrop-blur-md border-gray-100/50'
                } p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all hover:scale-[1.02] relative overflow-hidden group`}
              >
                {/* Decorative elements for glass effect */}
                <div className={`absolute inset-0 ${
                  report.status === 'Resolved' || report.status === 'Forwarded'
                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10'
                    : report.status === 'In Review'
                    ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10'
                    : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
                } opacity-30`}></div>
                
                <div className={`absolute -inset-1 ${
                  report.status === 'Resolved' || report.status === 'Forwarded'
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20'
                    : report.status === 'In Review'
                    ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20'
                    : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
                } rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`}></div>
                
                {/* Glass shimmer effect */}
                <div className="absolute -inset-1 opacity-0 group-hover:opacity-40 group-hover:animate-shimmer bg-[length:500%_100%] bg-gradient-to-r from-transparent via-white to-transparent transition-opacity"></div>
                
                <div className="relative">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex-1`}>
                      {report.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}
                    >
                      {report.status}
                    </span>
                  </div>
                  
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-2`}>
                    {report.location}
                  </div>
                  
                  <div className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} text-sm`}>
                    Last updated: {report.lastUpdated}
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