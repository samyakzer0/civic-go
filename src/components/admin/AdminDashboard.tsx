import { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Layers, BarChart4, Loader2, TrendingUp } from 'lucide-react';
import { getCurrentUser, signOut, getUserAdminCategories } from '../../services/supabase.ts';
import { useTheme } from '../../contexts/ThemeContext';
import CategoryAdmin from './CategoryAdmin';
import AdminAnalytics from '../AdminAnalytics';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate?: () => void;
  user?: any; // Add user prop
}

function AdminDashboard({ onLogout, onNavigate, user }: AdminDashboardProps) {
  const { theme } = useTheme();
  const [userName, setUserName] = useState<string>('');
  const [adminCategories, setAdminCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentView, setCurrentView] = useState<'categories' | 'analytics'>('analytics'); // Default to analytics
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user info and admin categories
    const loadUserInfo = async () => {
      try {
        setIsLoading(true);
        
        // Use the passed user prop if available, otherwise fetch the current user
        const currentUser = user || await getCurrentUser();
        
        if (currentUser) {
          // If user prop is provided, use name from it, otherwise use email
          if (user && user.name) {
            setUserName(user.name);
          } else {
            setUserName(currentUser.email || 'Admin');
          }
          
          // Get categories this admin manages
          const categories = await getUserAdminCategories();
          console.log('Admin categories:', categories);
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
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 md:rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onNavigate && (
              <button
                onClick={onNavigate}
                className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <BarChart4 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Admin Dashboard
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Municipal Management Portal
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {userName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-xl ${
                theme === 'dark' 
                  ? 'text-red-400 hover:bg-red-900/30' 
                  : 'text-red-600 hover:bg-red-100'
              } transition-colors`}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 pb-24 max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className={`mb-6 p-2 rounded-xl ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl shadow-lg border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'analytics'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-600 text-white shadow-lg'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
            >
              <TrendingUp size={18} />
              <span>Analytics Dashboard</span>
            </button>
            
            <button
              onClick={() => setCurrentView('categories')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'categories'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-600 text-white shadow-lg'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
            >
              <Layers size={18} />
              <span>Category Management</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {currentView === 'analytics' ? (
          /* Analytics Dashboard */
          <div>
            <AdminAnalytics />
          </div>
        ) : (
          /* Category Management */
          <div>
            {/* Category Selector */}
            <div className={`mb-6 p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl shadow-lg border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Layers size={20} className="text-purple-500" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Category Management
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage reports by category
                  </p>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm py-3 px-4">
                  <Loader2 size={16} className="animate-spin" />
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Loading categories...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {adminCategories.length > 0 ? (
                    adminCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category
                            ? theme === 'dark'
                              ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
                              : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
                            : theme === 'dark'
                            ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
                            : 'bg-gray-100/50 text-gray-700 hover:bg-gray-200/50 border border-gray-200/50'
                        }`}
                      >
                        {category}
                      </button>
                    ))
                  ) : (
                    <div className={`text-sm py-3 px-4 ${
                      theme === 'dark' 
                        ? 'text-gray-400 bg-gray-700/30' 
                        : 'text-gray-500 bg-gray-100/30'
                    } rounded-xl border ${
                      theme === 'dark' ? 'border-gray-600/30' : 'border-gray-200/30'
                    }`}>
                      No categories assigned to your admin account
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Main Content Area */}
            <div className={`rounded-xl shadow-xl ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white/60 border-gray-200/50'} backdrop-blur-xl border overflow-hidden`}>
              {selectedCategory ? (
                <CategoryAdmin category={selectedCategory} />
              ) : (
                <div className="text-center py-16">
                  <div className={`w-20 h-20 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Layers className={`h-10 w-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" /> Loading...
                      </span>
                    ) : (
                      'Select a Category'
                    )}
                  </p>
                  {!isLoading && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Choose a category from above to manage reports
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
