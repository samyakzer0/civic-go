import React from 'react';
import { Heart, Twitter } from 'lucide-react';

interface WelcomePageProps {
  onSignIn: (provider: string) => void;
  onContinueAnonymously: () => void;
}

function WelcomePage({ onSignIn, onContinueAnonymously }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 flex flex-col">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-gray-800">CivicGo</h1>
      </div>

      {/* Hero Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm mb-8">
          <img 
            src="https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800" 
            alt="Community illustration" 
            className="w-full h-64 object-cover rounded-2xl shadow-lg"
          />
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to CivicGo
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed px-4">
            Your voice for a better community. Report issues, track progress, and help make your neighborhood a better place.
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="w-full px-6 space-y-4">
          <button
            onClick={() => onSignIn('google')}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Heart size={24} />
            Sign in with Google
          </button>
          
          <button
            onClick={() => onSignIn('twitter')}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Twitter size={24} />
            Sign in with Twitter
          </button>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button
            onClick={onContinueAnonymously}
            className="w-full bg-white text-gray-700 py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
          >
            Continue Anonymously
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;