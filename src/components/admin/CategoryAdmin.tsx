import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { updateReportStatus, getReportById, ReportData, getCityList } from '../../services/ReportService';
import { createStatusUpdateNotification } from '../../utils/notificationUtils';
import { getReportsByCategoryWithRealData } from '../../services/ReportServiceEnhanced';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  RefreshCw,
  Search,
  Send,
  MapPin
} from 'lucide-react';
import Loader from '../Loader';

interface CategoryAdminProps {
  category: string;
}

function CategoryAdmin({ category }: CategoryAdminProps) {
  const { theme } = useTheme();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [cityList, setCityList] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Load reports on mount and when category changes
  useEffect(() => {
    loadReports();
    loadCityList();
  }, [category]);

  // Apply filters and sorting when reports, search term, or filters change
  useEffect(() => {
    applyFiltersAndSort();
  }, [reports, searchTerm, statusFilter, cityFilter, sortBy, sortOrder]);
  
  const loadCityList = async () => {
    try {
      const cities = await getCityList();
      setCityList(cities);
    } catch (error) {
      console.error('Error loading city list:', error);
    }
  };

  const loadReports = async () => {
    try {
      setIsLoading(true);
      // Case-insensitive match for the category with real data
      const categoryReports = await getReportsByCategoryWithRealData(category);
      console.log(`Fetched ${categoryReports.length} reports for category ${category}:`, categoryReports);
      setReports(categoryReports);
    } catch (error) {
      console.error(`Error loading ${category} reports:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...reports];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        report => 
          report.title.toLowerCase().includes(searchLower) ||
          report.description.toLowerCase().includes(searchLower) ||
          report.report_id.toLowerCase().includes(searchLower) ||
          report.location.address.toLowerCase().includes(searchLower) ||
          (report.city && report.city.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    
    // Apply city filter
    if (cityFilter) {
      filtered = filtered.filter(report => 
        report.city && report.city.toLowerCase() === cityFilter.toLowerCase()
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valA, valB;
      
      if (sortBy === 'created_at') {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else if (sortBy === 'updated_at') {
        valA = new Date(a.updated_at).getTime();
        valB = new Date(b.updated_at).getTime();
      } else if (sortBy === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (sortBy === 'city') {
        valA = (a.city || '').toLowerCase();
        valB = (b.city || '').toLowerCase();
      } else {
        valA = a[sortBy as keyof ReportData];
        valB = b[sortBy as keyof ReportData];
      }
      
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });
    
    setFilteredReports(filtered);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: 'Submitted' | 'In Review' | 'Forwarded' | 'Resolved') => {
    try {
      setIsUpdating(true);
      const success = await updateReportStatus(reportId, newStatus);
      
      if (success) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
        
        // Update the report in the current state
        const updatedReports = reports.map(report => {
          if (report.report_id === reportId) {
            return {
              ...report,
              status: newStatus,
              updated_at: new Date().toISOString()
            };
          }
          return report;
        });
        
        setReports(updatedReports);
        
        // If we're viewing report details, update the selected report
        if (selectedReport && selectedReport.report_id === reportId) {
          setSelectedReport({
            ...selectedReport,
            status: newStatus,
            updated_at: new Date().toISOString()
          });
        }

        // Get the full report to access all details including the user_id and title
        const report = await getReportById(reportId);
        if (report) {
          // Send a notification to the user who submitted the report
          await sendStatusUpdateNotification(report, newStatus);
        }
      }
    } catch (error) {
      console.error('Error updating report status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to send a notification about the status update
  const sendStatusUpdateNotification = async (report: ReportData, newStatus: string) => {
    try {
      const success = await createStatusUpdateNotification(report, newStatus);
      
      if (success) {
        console.log(`Notification sent to user ${report.user_id} about report ${report.report_id}`);
      } else {
        console.error(`Failed to send notification to user ${report.user_id}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
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

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {category} Reports
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadReports}
            className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {updateSuccess && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              theme === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
            }`}>
              <CheckCircle size={12} className="mr-1" />
              Updated
            </span>
          )}
        </div>
      </div>
      
      {/* Filter and Search Bar */}
      <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
            </div>
            <input
              type="text"
              placeholder="Search reports..."
              className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-1 ${
                theme === 'dark' ? 'focus:ring-blue-500' : 'focus:ring-blue-500'
              }`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
            </div>
            <select
              className={`block w-full pl-10 pr-3 py-2 border rounded-md appearance-none ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-1 ${
                theme === 'dark' ? 'focus:ring-blue-500' : 'focus:ring-blue-500'
              }`}
              value={statusFilter || ''}
              onChange={e => setStatusFilter(e.target.value || null)}
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="In Review">In Review</option>
              <option value="Forwarded">Forwarded</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin size={18} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
            </div>
            <select
              className={`block w-full pl-10 pr-3 py-2 border rounded-md appearance-none ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-1 ${
                theme === 'dark' ? 'focus:ring-blue-500' : 'focus:ring-blue-500'
              }`}
              value={cityFilter || ''}
              onChange={e => setCityFilter(e.target.value || null)}
            >
              <option value="">All Cities</option>
              {cityList.map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className="text-right">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'} found
            </span>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="medium" message="Loading reports..." />
        </div>
      ) : (
        <>
          {selectedReport ? (
            <div className={`rounded-lg shadow overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Report Details
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className={`px-3 py-1 rounded text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Back to List
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {selectedReport.title}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}
                        >
                          {selectedReport.status}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        ID: {selectedReport.report_id}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Description
                      </h4>
                      <p className={`mt-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                        {selectedReport.description}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Location
                      </h4>
                      <p className={`mt-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                        {selectedReport.location.address}
                      </p>
                      <p className={`mt-1 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        City: {selectedReport.city || 'Unknown'}
                      </p>
                      <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Lat: {selectedReport.location.lat.toFixed(6)}, Lng: {selectedReport.location.lng.toFixed(6)}
                      </p>
                      
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.location.lat},${selectedReport.location.lng}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`inline-flex items-center mt-2 text-sm ${
                          theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                        }`}
                      >
                        View on Google Maps
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                    
                    <div>
                      <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Timestamps
                      </h4>
                      <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Created: {formatDate(selectedReport.created_at)}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Updated: {formatDate(selectedReport.updated_at)}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Update Status
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleStatusChange(selectedReport.report_id, 'In Review')}
                          disabled={selectedReport.status === 'In Review' || isUpdating}
                          className={`px-3 py-1.5 rounded-md text-sm ${
                            selectedReport.status === 'In Review'
                              ? theme === 'dark'
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : theme === 'dark'
                              ? 'bg-yellow-800 text-yellow-100 hover:bg-yellow-700'
                              : 'bg-yellow-500 text-white hover:bg-yellow-600'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Clock size={14} className="inline mr-1" />
                          Mark as In Review
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(selectedReport.report_id, 'Forwarded')}
                          disabled={selectedReport.status === 'Forwarded' || isUpdating}
                          className={`px-3 py-1.5 rounded-md text-sm ${
                            selectedReport.status === 'Forwarded'
                              ? theme === 'dark'
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : theme === 'dark'
                              ? 'bg-blue-800 text-blue-100 hover:bg-blue-700'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Send size={14} className="inline mr-1" />
                          Mark as Forwarded
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(selectedReport.report_id, 'Resolved')}
                          disabled={selectedReport.status === 'Resolved' || isUpdating}
                          className={`px-3 py-1.5 rounded-md text-sm ${
                            selectedReport.status === 'Resolved'
                              ? theme === 'dark'
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : theme === 'dark'
                              ? 'bg-green-800 text-green-100 hover:bg-green-700'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <CheckCircle size={14} className="inline mr-1" />
                          Mark as Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image column */}
                  <div>
                    {selectedReport.image_url ? (
                      <>
                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Image
                        </h4>
                        <img
                          src={selectedReport.image_url}
                          alt={selectedReport.title}
                          className="w-full h-auto rounded-lg border border-gray-700"
                        />
                        <a
                          href={selectedReport.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center mt-2 text-sm ${
                            theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                          }`}
                        >
                          View Full Image
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      </>
                    ) : (
                      <div className={`rounded-lg border p-4 flex flex-col items-center justify-center h-48 ${theme === 'dark' ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          No image uploaded
                        </p>
                      </div>
                    )}
                    
                    <div className={`mt-4 rounded-lg border p-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
                      <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        User Information
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        User ID: {selectedReport.user_id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className={`min-w-full ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <button
                        className="flex items-center focus:outline-none"
                        onClick={() => handleSort('report_id')}
                      >
                        ID
                        {sortBy === 'report_id' && (
                          sortOrder === 'asc' ? 
                            <ArrowUp size={14} className="ml-1" /> : 
                            <ArrowDown size={14} className="ml-1" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <button
                        className="flex items-center focus:outline-none"
                        onClick={() => handleSort('title')}
                      >
                        Title
                        {sortBy === 'title' && (
                          sortOrder === 'asc' ? 
                            <ArrowUp size={14} className="ml-1" /> : 
                            <ArrowDown size={14} className="ml-1" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <button
                        className="flex items-center focus:outline-none"
                        onClick={() => handleSort('city')}
                      >
                        City
                        {sortBy === 'city' && (
                          sortOrder === 'asc' ? 
                            <ArrowUp size={14} className="ml-1" /> : 
                            <ArrowDown size={14} className="ml-1" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <button
                        className="flex items-center focus:outline-none"
                        onClick={() => handleSort('created_at')}
                      >
                        Created
                        {sortBy === 'created_at' && (
                          sortOrder === 'asc' ? 
                            <ArrowUp size={14} className="ml-1" /> : 
                            <ArrowDown size={14} className="ml-1" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <button
                        className="flex items-center focus:outline-none"
                        onClick={() => handleSort('updated_at')}
                      >
                        Updated
                        {sortBy === 'updated_at' && (
                          sortOrder === 'asc' ? 
                            <ArrowUp size={14} className="ml-1" /> : 
                            <ArrowDown size={14} className="ml-1" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredReports.map(report => (
                    <tr 
                      key={report.report_id} 
                      className={`${
                        theme === 'dark' 
                          ? 'hover:bg-gray-800/50 cursor-pointer' 
                          : 'hover:bg-gray-50 cursor-pointer'
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {report.report_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {report.title}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {report.city || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {formatDate(report.updated_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                          }}
                          className={`ml-2 px-2 py-1 rounded ${
                            theme === 'dark'
                              ? 'bg-blue-800 text-blue-100 hover:bg-blue-700'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || statusFilter ? 'No matching reports found' : 'No reports found for this category'}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CategoryAdmin;
