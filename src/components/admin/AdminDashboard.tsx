import { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Layers, Settings, Users, BarChart4, Loader2 } from 'lucide-react';
import { getCurrentUser, signOut, getUserAdminCategories } from '../../services/supabase.ts';
import { useTheme } from '../../contexts/ThemeContext';
import CategoryAdmin from './CategoryAdmin';

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
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {userName}
            </span>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-full ${
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
        {/* Category Selector */}
        <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-3`}>
            <Layers size={20} className="inline-block mr-2 mb-1" />
            Category Management
          </h2>
          
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm py-2 px-3">
              <Loader2 size={16} className="animate-spin" />
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Loading categories...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {adminCategories.length > 0 ? (
                adminCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedCategory === category
                        ? theme === 'dark'
                          ? 'bg-blue-700 text-white'
                          : 'bg-blue-600 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))
              ) : (
                <div className={`text-sm py-2 px-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No categories assigned to your admin account
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Dashboard Stats (placeholder) */}
        <div className={`mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4`}>
          <div className={`p-4 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Reports</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {isLoading ? <Loader2 size={24} className="animate-spin" /> : '128'}
                </p>
              </div>
              <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <BarChart4 size={24} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Active Users</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {isLoading ? <Loader2 size={24} className="animate-spin" /> : '42'}
                </p>
              </div>
              <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <Users size={24} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Resolved</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {isLoading ? <Loader2 size={24} className="animate-spin" /> : '86'}
                </p>
              </div>
              <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <Settings size={24} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pending</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {isLoading ? <Loader2 size={24} className="animate-spin" /> : '42'}
                </p>
              </div>
              <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
                <Settings size={24} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className={`rounded-xl shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border overflow-hidden`}>
          {selectedCategory ? (
            <CategoryAdmin category={selectedCategory} />
          ) : (
            <div className="text-center py-16">
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" /> Loading...
                  </span>
                ) : (
                  'Please select a category to manage'
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
