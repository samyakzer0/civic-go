import { useState, useEffect } from 'react';
import { ArrowLeft, Layers, BarChart4, Loader2, TrendingUp, ClipboardList, RefreshCw } from 'lucide-react';
import { getCurrentUser, getUserAdminCategories } from '../../services/supabase.ts';
import { useTheme } from '../../contexts/ThemeContext';
import CategoryAdmin from './CategoryAdmin';
import AdminAnalytics from '../AdminAnalytics';
import { TaskData, getTasksByCategory, getTaskStatsByCategory, getAllTasksForAdmin } from '../../services/ReportService';

interface AdminDashboardProps {
  onNavigate?: () => void;
  user?: any; // Add user prop
}

function AdminDashboard({ onNavigate, user }: AdminDashboardProps) {
  const { theme } = useTheme();
  const [userName, setUserName] = useState<string>('');
  const [adminCategories, setAdminCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentView, setCurrentView] = useState<'categories' | 'analytics' | 'tasks'>('analytics'); // Default to analytics
  const [isLoading, setIsLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<TaskData[]>([]);
  const [taskStats, setTaskStats] = useState<{[category: string]: any}>({});
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

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

  const loadAllTasks = async () => {
    if (adminCategories.length === 0) return;
    
    try {
      setIsLoadingTasks(true);
      
      const allTasksData = await getAllTasksForAdmin(adminCategories);
      
      const stats: {[category: string]: any} = {};
      
      for (const category of adminCategories) {
        const categoryStats = await getTaskStatsByCategory(category);
        stats[category] = categoryStats;
      }
      
      setAllTasks(allTasksData);
      setTaskStats(stats);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Function to refresh tasks - can be called from child components
  const refreshTasks = () => {
    loadAllTasks();
  };

  useEffect(() => {
    if (adminCategories.length > 0) {
      loadAllTasks();
    }
  }, [adminCategories]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b pt-2 pb-4 px-4 md:rounded-t-xl`}>
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
              
              <div>
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Admin
                </h1>
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
          </div>
        </div>
      </div>

      <div className="p-6 pb-24 max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className={`mb-6 p-2 rounded-xl ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl shadow-lg border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
              <span className="hidden sm:inline">Analytics Dashboard</span>
              <span className="sm:hidden">Analytics</span>
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
              <span className="hidden sm:inline">Category Management</span>
              <span className="sm:hidden">Categories</span>
            </button>
            
            <button
              onClick={() => setCurrentView('tasks')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'tasks'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-600 text-white shadow-lg'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
            >
              <ClipboardList size={18} />
              <span className="hidden sm:inline">Task Management</span>
              <span className="sm:hidden">Tasks</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {currentView === 'analytics' ? (
          /* Analytics Dashboard */
          <div>
            <AdminAnalytics />
          </div>
        ) : currentView === 'tasks' ? (
          /* Task Management */
          <div>
            <div className={`mb-6 p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl shadow-lg border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <ClipboardList size={20} className="text-orange-500" />
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Task Management
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Overview of all tasks across your categories
                  </p>
                </div>
                <button
                  onClick={refreshTasks}
                  className={`p-2 rounded-xl ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                  } transition-colors`}
                  title="Refresh tasks"
                >
                  <RefreshCw size={18} className={isLoadingTasks ? 'animate-spin' : ''} />
                </button>
              </div>
              
              {/* Task Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {adminCategories.map(category => {
                  const stats = taskStats[category] || { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
                  return (
                    <div key={category} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                      <h3 className={`font-medium text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {category}
                      </h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total:</span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Pending:</span>
                          <span className="font-medium text-yellow-600">{stats.pending}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>In Progress:</span>
                          <span className="font-medium text-blue-600">{stats.inProgress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Completed:</span>
                          <span className="font-medium text-green-600">{stats.completed}</span>
                        </div>
                        {stats.overdue > 0 && (
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Overdue:</span>
                            <span className="font-medium text-red-600">{stats.overdue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Task List */}
              <div className={`rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} overflow-hidden`}>
                <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    All Tasks ({allTasks.length})
                  </h3>
                </div>
                
                {isLoadingTasks ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin mr-2" />
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Loading tasks...</span>
                  </div>
                ) : allTasks.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {allTasks
                      .sort((a, b) => {
                        // Sort by priority first, then by due date
                        const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
                        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                        if (priorityDiff !== 0) return priorityDiff;
                        
                        // Then by due date (null dates go to the end)
                        if (a.due_date && b.due_date) {
                          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                        }
                        if (a.due_date) return -1;
                        if (b.due_date) return 1;
                        return 0;
                      })
                      .map(task => (
                        <div
                          key={task.id}
                          className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} hover:${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  task.priority === 'Urgent'
                                    ? 'bg-red-100 text-red-800'
                                    : task.priority === 'High'
                                    ? 'bg-orange-100 text-orange-800'
                                    : task.priority === 'Medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {task.priority}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  task.status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : task.status === 'In Progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : task.status === 'Cancelled'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {task.status}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {task.category}
                                </span>
                              </div>
                              <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                {task.task_description}
                              </p>
                              <div className="flex items-center gap-4 text-xs">
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                  Report: {task.report_id}
                                </span>
                                {task.due_date && (
                                  <span className={`${
                                    new Date(task.due_date) < new Date()
                                      ? 'text-red-600 font-medium'
                                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {task.notes && (
                                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {task.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardList size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                      No tasks found
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Tasks will appear here once they are assigned to reports in your categories
                    </p>
                  </div>
                )}
              </div>
            </div>
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
                <CategoryAdmin category={selectedCategory} onTasksChange={refreshTasks} />
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
