import React, { useState, useEffect } from 'react';
import { getCurrentUser, signOut, getUserAdminCategories } from '../../services/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import CategoryAdmin from './CategoryAdmin';

interface AdminDashboardProps {
  onLogout: () => void;
}

function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { theme } = useTheme();
  const [userName, setUserName] = useState<string>('');
  const [adminCategories, setAdminCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user info and admin categories
    const loadUserInfo = async () => {
      try {
        setIsLoading(true);
        const user = await getCurrentUser();
        if (user) {
          setUserName(user.email || 'Admin');
          
          // Get categories this admin manages
          const categories = await getUserAdminCategories();
          setAdminCategories(categories);
          
          // Set default selected category
          if (categories.length > 0) {
            setSelectedCategory(categories[0]);
          }
        }
      } catch (error) {
        console.error('Error loading admin info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <div className="flex h-screen overflow-hidden">
        <div className={`hidden md:flex md:flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col w-64">
            {/* Sidebar header */}
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-700">
              <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                CivicGo Admin
              </h2>
            </div>
            
            {/* Sidebar content */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                <div className={`px-3 py-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p className="text-sm">Logged in as:</p>
                  <p className="font-medium truncate">{userName}</p>
                </div>
                
                <div className={`mt-6 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider">Categories</h3>
                </div>
                
                {isLoading ? (
                  <div className={`px-3 py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Loading...
                  </div>
                ) : adminCategories.length > 0 ? (
                  adminCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                        selectedCategory === category
                          ? theme === 'dark'
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-200 text-gray-900'
                          : theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))
                ) : (
                  <div className={`px-3 py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No categories assigned
                  </div>
                )}
                
                {/* Logout button */}
                <div className="pt-6 px-3">
                  <button
                    onClick={handleLogout}
                    className={`w-full px-3 py-2 text-sm font-medium rounded-md ${
                      theme === 'dark'
                        ? 'bg-red-800 text-white hover:bg-red-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Log Out
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Mobile sidebar & header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-10">
          <div className={`flex items-center justify-between h-16 px-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              CivicGo Admin
            </h2>
            
            <div className="flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`mr-2 px-2 py-1 rounded text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border`}
              >
                {adminCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleLogout}
                className={`px-2 py-1 text-sm font-medium rounded ${
                  theme === 'dark'
                    ? 'bg-red-800 text-white'
                    : 'bg-red-600 text-white'
                }`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto pt-0 md:pt-0">
          <div className="py-6 md:py-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-16 md:mt-0">
              {selectedCategory ? (
                <CategoryAdmin category={selectedCategory} />
              ) : (
                <div className="text-center py-12">
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    {isLoading ? 'Loading...' : 'No category selected'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
