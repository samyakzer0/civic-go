import React, { useState } from 'react';
import { Edit3, ChevronRight, LogOut } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  user: any;
  onSignOut: () => void;
}

function ProfilePage({ onNavigate, user, onSignOut }: ProfilePageProps) {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-8">
            Please sign in to access your profile and preferences.
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
        <h1 className="text-xl font-bold text-gray-800 text-center">Profile</h1>
      </div>

      <div className="p-6 pb-24">
        {/* Profile Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <Edit3 size={16} />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
            <p className="text-gray-600">Joined {user.joinedYear}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Email</span>
              <span className="text-gray-800 font-medium">{user.email}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Phone</span>
              <span className="text-gray-800 font-medium">{user.phone}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Password</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Change
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Push Notifications</span>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    pushNotifications ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Email Notifications</span>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    emailNotifications ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">App Settings</h3>
          
          <div className="space-y-4">
            <button className="flex justify-between items-center w-full py-2 text-left">
              <span className="text-gray-700">Language</span>
              <div className="flex items-center gap-2 text-gray-600">
                <span>English</span>
                <ChevronRight size={16} />
              </div>
            </button>
            
            <button className="flex justify-between items-center w-full py-2 text-left">
              <span className="text-gray-700">Theme</span>
              <div className="flex items-center gap-2 text-gray-600">
                <span>Light</span>
                <ChevronRight size={16} />
              </div>
            </button>
            
            <button className="flex justify-between items-center w-full py-2 text-left">
              <span className="text-gray-700">About CivicGo</span>
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onSignOut}
          className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-3"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;