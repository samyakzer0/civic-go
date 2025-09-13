/**
 * Simplified Proof Explorer - Professional dashboard for audit trail status
 * 
 * Shows proof statistics and report audit status with a clean, modern layout
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, CheckCircle, XCircle, ExternalLink, BarChart3, Database, Clock, Search } from 'lucide-react';
import { proofOfReportService } from '../services/ProofOfReportServiceSimplified';
import { supabase } from '../services/supabase';

interface ReportWithProof {
  report_id: string;
  title?: string;
  city: string;
  created_at: string;
  proof_cid?: string;
  proof_timestamp?: string;
  has_proof: boolean;
  status: string;
}

interface ProofStats {
  totalReports: number;
  reportsWithProofs: number;
  totalProofs: number;
  isConfigured: boolean;
}

function ProofExplorerSimplified() {
  const { theme } = useTheme();
  const [reports, setReports] = useState<ReportWithProof[]>([]);
  const [stats, setStats] = useState<ProofStats>({
    totalReports: 0,
    reportsWithProofs: 0,
    totalProofs: 0,
    isConfigured: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Load reports and proof statistics
   */
  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get all reports with proof information
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('report_id, title, city, created_at, proof_cid, proof_timestamp, status')
        .order('created_at', { ascending: false })
        .limit(100);

      if (reportsError) {
        console.error('Error loading reports:', reportsError);
        return;
      }

      // Transform data to include proof status
      const reportsWithProofStatus: ReportWithProof[] = (reportsData || []).map(report => ({
        ...report,
        has_proof: !!(report.proof_cid),
        title: report.title || `Report ${report.report_id}`
      }));

      setReports(reportsWithProofStatus);

      // Calculate statistics
      const totalReports = reportsWithProofStatus.length;
      const reportsWithProofs = reportsWithProofStatus.filter(r => r.has_proof).length;

      // Get Pinata statistics
      const proofServiceStats = await proofOfReportService.getProofStatistics();

      setStats({
        totalReports,
        reportsWithProofs,
        totalProofs: proofServiceStats.totalProofs,
        isConfigured: proofServiceStats.isConfigured
      });

    } catch (error) {
      console.error('Error loading proof data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReports = reports.filter(report =>
    (report.report_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (report.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (report.city?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const proofCoverage = stats.totalReports > 0 ? (stats.reportsWithProofs / stats.totalReports) * 100 : 0;

  return (
    <div className={`min-h-screen ${theme === 'dark' 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
    }`}>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-2 sm:p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Shield className={`w-6 h-6 sm:w-8 sm:h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Proof Explorer
                </h1>
                <p className={`text-base sm:text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Decentralized audit trail monitoring dashboard
                </p>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50 shadow-lg hover:shadow-xl w-full sm:w-auto`}
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Refresh Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Reports */}
          <div className={`group p-4 sm:p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            theme === 'dark' 
              ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90' 
              : 'bg-white/80 border-gray-200/50 hover:bg-white/90'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Reports
                </p>
                <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-300 h-6 sm:h-8 w-12 sm:w-16 rounded"></div>
                  ) : (
                    stats.totalReports.toLocaleString()
                  )}
                </p>
                <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  All submitted reports
                </p>
              </div>
              <div className={`p-3 sm:p-4 rounded-xl ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'} group-hover:scale-110 transition-transform`}>
                <Database className={`w-6 h-6 sm:w-8 sm:h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>

          {/* Verified Reports */}
          <div className={`group p-4 sm:p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            theme === 'dark' 
              ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90' 
              : 'bg-white/80 border-gray-200/50 hover:bg-white/90'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Verified Reports
                </p>
                <p className={`text-2xl sm:text-3xl font-bold text-green-500 mt-1`}>
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-300 h-6 sm:h-8 w-12 sm:w-16 rounded"></div>
                  ) : (
                    stats.reportsWithProofs.toLocaleString()
                  )}
                </p>
                <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  With blockchain proof
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-green-50 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Coverage Percentage */}
          <div className={`group p-4 sm:p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            theme === 'dark' 
              ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90' 
              : 'bg-white/80 border-gray-200/50 hover:bg-white/90'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Proof Coverage
                </p>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 ${
                  proofCoverage >= 80 ? 'text-green-500' :
                  proofCoverage >= 50 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-300 h-6 sm:h-8 w-12 sm:w-16 rounded"></div>
                  ) : (
                    `${proofCoverage.toFixed(1)}%`
                  )}
                </p>
                <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  Audit completion rate
                </p>
              </div>
              <div className={`p-3 sm:p-4 rounded-xl group-hover:scale-110 transition-transform ${
                proofCoverage >= 80 ? 'bg-green-50' :
                proofCoverage >= 50 ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <BarChart3 className={`w-6 h-6 sm:w-8 sm:h-8 ${
                  proofCoverage >= 80 ? 'text-green-500' :
                  proofCoverage >= 50 ? 'text-yellow-500' : 'text-red-500'
                }`} />
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className={`group p-4 sm:p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            theme === 'dark' 
              ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90' 
              : 'bg-white/80 border-gray-200/50 hover:bg-white/90'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  IPFS Status
                </p>
                <p className={`text-xl sm:text-2xl font-bold mt-1 ${
                  stats.isConfigured ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-300 h-6 sm:h-8 w-16 sm:w-20 rounded"></div>
                  ) : (
                    stats.isConfigured ? 'Connected' : 'Dev Mode'
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    stats.isConfigured ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {stats.isConfigured ? 'Pinata active' : 'Mock storage'}
                  </p>
                </div>
              </div>
              <div className={`p-3 sm:p-4 rounded-xl group-hover:scale-110 transition-transform ${
                stats.isConfigured ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <Shield className={`w-6 h-6 sm:w-8 sm:h-8 ${
                  stats.isConfigured ? 'text-green-500' : 'text-yellow-500'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-sm mb-4 sm:mb-6 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700/50' 
            : 'bg-white/80 border-gray-200/50'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search by ID, title, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:bg-gray-700/80'
                    : 'bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:bg-white/80'
                } focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none`}
              />
            </div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center sm:text-left`}>
              Showing {filteredReports.length} of {stats.totalReports} reports
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className={`rounded-2xl border backdrop-blur-sm overflow-hidden shadow-xl ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700/50' 
            : 'bg-white/80 border-gray-200/50'
        }`}>
          <div className={`px-4 sm:px-6 py-4 border-b ${
            theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
          }`}>
            <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Audit Trail
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Complete history of report verification status
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/80'}`}>
                <tr>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Report Details
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Proof Status
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Date Created
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700/50' : 'divide-gray-200/50'}`}>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-500" />
                        <span className={`text-base sm:text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Loading audit trail...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 sm:px-6 py-12 sm:py-16 text-center">
                      <div className="flex flex-col items-center">
                        <Shield className={`w-12 h-12 sm:w-16 sm:h-16 mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                        <h3 className={`text-lg sm:text-xl font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {searchTerm ? 'No matching reports' : 'No reports found'}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {searchTerm 
                            ? 'Try adjusting your search terms or clearing filters' 
                            : 'Reports will appear here once they are submitted to the system'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.report_id} className={`hover:${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50/50'} transition-colors`}>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div>
                          <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-base sm:text-lg`}>
                            {report.title || 'Untitled Report'}
                          </div>
                          <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1`}>
                            <span>📍 {report.city}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>ID: {report.report_id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${
                          report.status === 'resolved' 
                            ? 'bg-green-100 text-green-800' 
                            : report.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          {report.has_proof ? (
                            <>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                <span className="text-green-600 font-semibold text-sm">Verified</span>
                              </div>
                              <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Blockchain proof
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium text-sm`}>
                                  Pending
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            {new Date(report.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs mt-1 opacity-75">
                            {new Date(report.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        {report.has_proof && report.proof_cid ? (
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${report.proof_cid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">View Proof</span>
                            <span className="sm:hidden">View</span>
                          </a>
                        ) : (
                          <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} italic`}>
                            No proof available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProofExplorerSimplified;