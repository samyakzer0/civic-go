import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

function AboutPage({ onNavigate }: AboutPageProps) {
  const { language, theme } = useTheme();
  const t = translations[language];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('profile')}
            className={`p-2 -ml-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {t.aboutCivicGo}
          </h1>
        </div>
      </div>

      <div className="p-6 pb-24 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden shadow-lg mb-8`}>
          <div className="h-48 bg-gradient-to-r from-blue-500 to-green-500 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-pattern"></div>
          </div>
          <div className="p-6">
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {t.aboutCivicGo}
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed mb-6`}>
              {t.aboutDescription}
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-md`}>
            <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              Our Mission
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              {t.mission}
            </p>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-md`}>
            <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              Our Vision
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              {t.vision}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-md mb-8`}>
          <h3 className={`text-xl font-semibold mb-5 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Key Features
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className={`${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'} p-3 rounded-full mr-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h4 className={`text-lg font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Easy Issue Reporting
                </h4>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Report civic issues with a few taps, including location detection and photo uploads.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className={`${theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600'} p-3 rounded-full mr-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className={`text-lg font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Real-time Status Tracking
                </h4>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Track the progress of reported issues from submission to resolution.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className={`${theme === 'dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'} p-3 rounded-full mr-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className={`text-lg font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Community Engagement
                </h4>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Collaborate with your community to identify and address local civic issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-md`}>
          <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {t.contactUs}
          </h3>
          
          <div className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4`}>
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <strong>Email:</strong> support@civicgo.org
              </p>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
            
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <strong>Address:</strong><br />
                123 Civic Center Plaza<br />
                Suite 456<br />
                Anytown, ST 12345<br />
                United States
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
