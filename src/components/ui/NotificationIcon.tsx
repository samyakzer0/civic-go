import React, { useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Notification } from '../../services/NotificationService';

interface NotificationIconProps {
  userId: string;
  onNavigate?: (page: string) => void;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ userId, onNavigate }) => {
  const { theme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Add click outside listener when panel is shown
  React.useEffect(() => {
    if (!showPanel) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowPanel(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPanel]);
  
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to related report if available
    if (notification.related_report_id && onNavigate) {
      onNavigate('status');
      setShowPanel(false);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors relative`}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {showPanel && (
        <div 
          ref={panelRef} 
          className={`absolute right-0 mt-2 w-80 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border rounded-lg shadow-lg z-50 overflow-hidden`}
        >
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className={`text-xs ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 5).map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${
                    !notification.read 
                      ? theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50/50' 
                      : ''
                  } cursor-pointer hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <div className="flex items-start">
                    <div className={`w-2 h-2 mt-2 rounded-full mr-2 ${
                      !notification.read 
                        ? 'bg-blue-500' 
                        : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                    }`} />
                    <div>
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {notification.title}
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 5 && (
            <div className="p-2 text-center border-t border-gray-700">
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('notifications');
                    setShowPanel(false);
                  }
                }}
                className={`text-sm ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
