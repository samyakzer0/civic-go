import React from 'react';
import { ArrowLeft } from 'lucide-react';

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
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-8">
            Please sign in to view your report status and track progress.
          </p>
          <button
            onClick={() => onNavigate('welcome')}
            className="bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Report Status</h1>
        </div>
      </div>

      <div className="p-6 pb-24">
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No reports yet.</p>
            <button
              onClick={() => onNavigate('report')}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Submit Your First Report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex-1">
                    {report.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}
                  >
                    {report.status}
                  </span>
                </div>
                
                <div className="text-gray-600 text-sm mb-2">
                  {report.location}
                </div>
                
                <div className="text-gray-500 text-sm">
                  Last updated: {report.lastUpdated}
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