'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, MessageCircle, ThumbsUp, ThumbsDown, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/lib/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth-store';
import { useLayoutStable, optimizeNotificationRender } from '@/lib/performance-utils';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { isAuthenticated } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();
  
  const layoutClasses = useLayoutStable();
  const renderOptimizations = optimizeNotificationRender(notifications);// Fetch notifications
  const handleFetchNotifications = async () => {
    if (isAuthenticated && !hasInitialized) {
      await fetchNotifications();
      setHasInitialized(true);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'upvote':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'downvote':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'complaint_status_change':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Navigate to the complaint
    if (notification.data?.complaintId) {
      window.location.href = `/complaint/${notification.data.complaintId}`;
    }
  };
  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      handleFetchNotifications();
    }
  }, [isOpen, isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative h-9 w-9 rounded-full optimized-button prevent-layout-shift"
        >
          <Bell className="h-4 w-4 transition-transform duration-200" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="notification-badge top-0 right-0 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
        <DropdownMenuContent 
        className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 shadow-2xl dropdown-content prevent-layout-shift" 
        align="end"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-6 px-2"
            >
              Mark all read
            </Button>
          )}
        </div>        {/* Notifications List */}
        <div 
          className="h-96 relative"
          style={renderOptimizations.containerStyle}
        >
          <ScrollArea className={`h-full ${layoutClasses.listClasses}`}>{isLoading && !hasInitialized ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Bell className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (              <div className="py-2" style={renderOptimizations.listStyle}>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors duration-200 border-l-2 min-h-[72px] ${
                      !notification.read 
                        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-blue-500' 
                        : 'border-l-transparent'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                        {notification.title}
                      </p>                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 overflow-hidden">
                        <span className="line-clamp-2 block">
                          {notification.message}
                        </span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0 mt-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"                onClick={() => {
                  window.location.href = '/notifications';
                  setIsOpen(false);
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
