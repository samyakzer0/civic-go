import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, ExternalLink, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getReportById, ReportData, getThumbnailUrl } from '../services/ReportService';
import { ShinyButton } from './magicui/shiny-button';

interface ReportDetailPageProps {
  onNavigate: (page: string) => void;
  reportId: string;
}

function ReportDetailPage({ onNavigate, reportId }: ReportDetailPageProps) {
  const { theme } = useTheme();

  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReportDetails();
  }, [reportId]);

  const loadReportDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const reportData = await getReportById(reportId);
      if (reportData) {
        setReport(reportData);
      } else {
        setError('Report not found');
      }
    } catch (err) {
      console.error('Error loading report details:', err);
      setError('Failed to load report details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const getPriorityColor = (priority: ReportData['priority']) => {
    switch (priority) {
      case 'Urgent':
        return theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'High':
        return theme === 'dark' ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800';
      case 'Medium':
        return theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800';
      default:
        return theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800';
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

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'} mx-auto mb-4`}></div>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('status')}
              className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Report Details</h1>
          </div>
        </div>

        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} flex items-center justify-center`}>
              <span className="text-2xl">❌</span>
            </div>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
              {error || 'Report Not Found'}
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              The report you're looking for could not be found or has been removed.
            </p>
            <button
              onClick={() => onNavigate('status')}
              className={`${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 px-6 rounded-xl font-semibold transition-colors`}
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('status')}
            className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Report Details</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Ref: {report.report_id}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 pb-24 max-w-4xl mx-auto">
        {/* Report Card */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden`}>

          {/* Status and Priority Badges */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(report.category)}</span>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {report.title}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(report.priority)}`}>
                  {report.priority} Priority
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
                Description
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                {report.description}
              </p>
            </div>
          </div>

          {/* Image Section */}
          {report.image_url && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>
                Attached Image
              </h3>
              <div className="relative">
                {getThumbnailUrl(report.image_url, 400) ? (
                  <>
                    <img
                      src={getThumbnailUrl(report.image_url, 400)}
                      alt="Report attachment"
                      className="w-full h-auto rounded-lg border border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(report.image_url, '_blank')}
                      onError={(e) => {
                        // Hide broken images
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <a
                      href={report.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center mt-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-blue-900/50 text-blue-200 hover:bg-blue-800 border border-blue-700'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      <Eye size={16} className="mr-2" />
                      View Full Image
                      <ExternalLink size={14} className="ml-2" />
                    </a>
                  </>
                ) : (
                  <div className={`rounded-lg border p-8 flex flex-col items-center justify-center h-48 ${theme === 'dark' ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
                    <div className={`w-12 h-12 mb-3 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                      <span className="text-xl">📷</span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Image not available
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Location */}
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-3 flex items-center`}>
                  <MapPin size={20} className="mr-2" />
                  Location
                </h3>
                <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {report.location.address}
                  </p>
                  {report.city && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      City: {report.city}
                    </p>
                  )}
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Coordinates: {report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Category & Priority */}
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-3`}>
                  Report Details
                </h3>
                <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 space-y-3`}>
                  <div className="flex justify-between items-center">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Category:</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {report.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Priority:</span>
                    <span className={`font-medium ${getPriorityColor(report.priority)} px-2 py-1 rounded text-sm`}>
                      {report.priority}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
                    <span className={`font-medium ${getStatusColor(report.status)} px-2 py-1 rounded text-sm border`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="md:col-span-2">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-3 flex items-center`}>
                  <Clock size={20} className="mr-2" />
                  Timeline
                </h3>
                <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        Created
                      </div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-1`}>
                        {formatDate(report.created_at)}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {getRelativeTime(report.created_at)}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        Last Updated
                      </div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-1`}>
                        {formatDate(report.updated_at)}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {getRelativeTime(report.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <ShinyButton
            onClick={() => onNavigate('status')}
            size="lg"
            className="flex-1 shadow-lg"
          >
            <ArrowLeft size={20} />
            Back to Reports
          </ShinyButton>
          <ShinyButton
            onClick={() => onNavigate('report')}
            size="lg"
            className="flex-1 shadow-lg"
          >
            <span>📝</span>
            Submit New Report
          </ShinyButton>
        </div>
      </div>
    </div>
  );
}

export default ReportDetailPage;
