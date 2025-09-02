import React from 'react';
import { Settings } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-green-50 to-blue-50">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold text-gray-800">CivicGo</h1>
        <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
          <Settings size={24} />
        </button>
      </div>

      {/* Hero Section */}
      <div className="px-6 pt-8">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Make Your Voice Heard
            </h2>
            <p className="text-lg opacity-90 mb-8 leading-relaxed">
              Report issues, track progress, and engage with your community to build a better neighborhood together.
            </p>
            
            <button
              onClick={() => onNavigate('report')}
              className="bg-white text-blue-600 py-4 px-8 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg w-full"
            >
              Report New Issue
            </button>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-8 -translate-x-8"></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Community Impact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-1">347</div>
            <div className="text-sm text-gray-600">Issues Resolved</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600 mb-1">2.3d</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Updates</h3>
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Pothole on Main St</div>
              <div className="text-sm text-gray-600">Resolved • 2 hours ago</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Streetlight Outage</div>
              <div className="text-sm text-gray-600">In Review • 1 day ago</div>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  );
}

export default HomePage;