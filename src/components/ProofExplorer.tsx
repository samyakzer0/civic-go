/**
 * Proof Explorer Component - Displays and manages proof-of-report data for transparency
 * 
 * This component provides administrators with a comprehensive view of the decentralized
 * proof system, allowing them to verify reports, view statistics, and explore the
 * tamper-proof audit trail stored on IPFS.
 * 
 * Features:
 * - Real-time proof statistics dashboard
 * - Report list with proof status indicators
 * - Individual proof verification
 * - IPFS link for external verification
 * - Search and filtering capabilities
 * - Batch verification operations
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  getProofStatistics, 
  getReportsWithProofInfo, 
  verifyReportProof,
  type ReportData 
} from '../services/ReportService';
import { proofOfReportService } from '../services/ProofOfReportService';

interface ProofStatistics {
  totalReports: number;
  reportsWithProof: number;
  verifiedProofs: number;
  pendingProofs: number;
  failedProofs: number;
  proofCoveragePercentage: number;
  verificationSuccessRate: number;
}

const ProofExplorer: React.FC = () => {
  const { theme } = useTheme();
  
  // State management
  const [statistics, setStatistics] = useState<ProofStatistics>({
    totalReports: 0,
    reportsWithProof: 0,
    verifiedProofs: 0,
    pendingProofs: 0,
    failedProofs: 0,
    proofCoveragePercentage: 0,
    verificationSuccessRate: 0
  });
  
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'failed' | 'no-proof'>('all');
  const [ipfsStatus, setIpfsStatus] = useState<{ ready: boolean; nodeInfo?: any }>({ ready: false });
  const [selectedProof, setSelectedProof] = useState<ReportData | null>(null);
  const [proofDetails, setProofDetails] = useState<any>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
    checkIpfsStatus();
  }, []);

  /**
   * Load proof statistics and reports data
   */
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load statistics and reports in parallel
      const [statsResult, reportsResult] = await Promise.all([
        getProofStatistics(),
        getReportsWithProofInfo(100, 0) // Load first 100 reports
      ]);
      
      setStatistics(statsResult);
      setReports(reportsResult);
      
    } catch (error) {
      console.error('Error loading proof explorer data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check IPFS service status
   */
  const checkIpfsStatus = async () => {
    try {
      const status = await proofOfReportService.getServiceStatus();
      setIpfsStatus({ ready: status.ipfsReady, nodeInfo: status.nodeInfo });
    } catch (error) {
      console.error('Error checking IPFS status:', error);
      setIpfsStatus({ ready: false });
    }
  };

  /**
   * Verify a specific proof
   */
  const handleVerifyProof = async (report: ReportData) => {
    if (!report.proof_cid) return;
    
    try {
      setVerifying(report.report_id);
      
      const success = await verifyReportProof(report.report_id, report.proof_cid);
      
      if (success) {
        // Reload data to show updated status
        await loadData();
      }
      
    } catch (error) {
      console.error('Error verifying proof:', error);
    } finally {
      setVerifying(null);
    }
  };

  /**
   * View proof details
   */
  const handleViewProofDetails = async (report: ReportData) => {
    if (!report.proof_cid) return;
    
    try {
      setSelectedProof(report);
      setProofDetails(null);
      
      const result = await proofOfReportService.verifyProofOfReport(report.proof_cid, report.report_id);
      
      if (result.success) {
        setProofDetails(result.proof);
      } else {
        setProofDetails({ error: result.error });
      }
      
    } catch (error) {
      console.error('Error loading proof details:', error);
      setProofDetails({ error: 'Failed to load proof details' });
    }
  };

  /**
   * Filter reports based on search term and status
   */
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.report_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'no-proof' && !report.proof_cid) ||
      (filterStatus !== 'no-proof' && report.proof_verification_status === filterStatus);
    
    return matchesSearch && matchesStatus;
  });

  /**
   * Get status badge component
   */
  const getStatusBadge = (report: ReportData) => {
    if (!report.proof_cid) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          No Proof
        </span>
      );
    }

    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Pending' },
      verified: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Verified' },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Failed' }
    };

    const config = statusConfig[report.proof_verification_status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  /**
   * Format CID for display (truncated with copy functionality)
   */
  const formatCID = (cid: string) => {
    if (!cid) return 'N/A';
    const truncated = `${cid.substring(0, 12)}...${cid.substring(cid.length - 8)}`;
    
    return (
      <button
        onClick={() => navigator.clipboard.writeText(cid)}
        className="text-blue-600 dark:text-blue-400 hover:underline font-mono text-sm"
        title="Click to copy full CID"
      >
        {truncated}
      </button>
    );
  };

  if (loading) {
    return (
      <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className={`ml-3 text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Loading proof data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with IPFS Status */}
      <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Proof Explorer
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${ipfsStatus.ready ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              IPFS {ipfsStatus.ready ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Explore and verify tamper-proof report proofs stored on the decentralized IPFS network.
          Each proof provides an immutable audit trail for transparency and accountability.
        </p>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {statistics.totalReports}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Reports
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {statistics.reportsWithProof}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                With Proofs ({statistics.proofCoveragePercentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {statistics.verifiedProofs}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Verified Proofs
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {statistics.verificationSuccessRate.toFixed(1)}%
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Success Rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by report ID, title, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          <div className="flex space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Reports</option>
              <option value="no-proof">No Proof</option>
              <option value="pending">Pending Verification</option>
              <option value="verified">Verified</option>
              <option value="failed">Failed Verification</option>
            </select>
            
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Report
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  City
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Proof Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  IPFS CID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Created
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              {filteredReports.map((report) => (
                <tr key={report.report_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {report.title.length > 40 ? `${report.title.substring(0, 40)}...` : report.title}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {report.report_id}
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                    {report.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(report)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatCID(report.proof_cid || '')}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {new Date(report.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {report.proof_cid && (
                      <>
                        <button
                          onClick={() => handleViewProofDetails(report)}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleVerifyProof(report)}
                          disabled={verifying === report.report_id}
                          className="text-green-600 dark:text-green-400 hover:underline disabled:opacity-50"
                        >
                          {verifying === report.report_id ? 'Verifying...' : 'Verify'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredReports.length === 0 && (
          <div className="p-8 text-center">
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No reports found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Proof Details Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-2xl w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Proof Details
                </h3>
                <button
                  onClick={() => setSelectedProof(null)}
                  className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-200`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Report Title
                  </label>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedProof.title}
                  </p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    IPFS CID
                  </label>
                  <p className={`text-sm font-mono ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} break-all`}>
                    {selectedProof.proof_cid}
                  </p>
                </div>
                
                {proofDetails && !proofDetails.error && (
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Proof Data (from IPFS)
                    </label>
                    <pre className={`text-xs p-3 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'} overflow-x-auto`}>
                      {JSON.stringify(proofDetails, null, 2)}
                    </pre>
                  </div>
                )}
                
                {proofDetails && proofDetails.error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded">
                    <p className="text-red-800 dark:text-red-200 text-sm">
                      Error: {proofDetails.error}
                    </p>
                  </div>
                )}
                
                {selectedProof.proof_cid && (
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      External Verification
                    </label>
                    <a
                      href={`https://ipfs.io/ipfs/${selectedProof.proof_cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View on IPFS Gateway
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofExplorer;