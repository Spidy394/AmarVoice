'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { useNotifications } from '@/lib/useNotifications';
import { 
  Bell, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  RefreshCw,
  CheckCircle 
} from 'lucide-react';

const NotificationTestPanel = () => {
  const [isCreating, setIsCreating] = useState({});
  const { isAuthenticated } = useAuth();
  const { unreadCount, refetch } = useNotifications();

  // Create different types of test notifications
  const createTestNotification = async (type) => {
    if (!isAuthenticated) return;
    
    try {
      setIsCreating(prev => ({ ...prev, [type]: true }));
      
      // Since we only have a general test endpoint, we'll use it
      await api.post('/notifications/test');
      
      // Refresh notifications
      await refetch();
      
    } catch (error) {
      console.error('Failed to create test notification:', error);
    } finally {
      setIsCreating(prev => ({ ...prev, [type]: false }));
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Test Panel
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Test the notification system by creating sample notifications:
        </div>
        
        <Button
          onClick={() => createTestNotification('upvote')}
          disabled={isCreating.upvote}
          className="w-full justify-start"
          variant="outline"
        >
          {isCreating.upvote ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
          )}
          Create Upvote Notification
        </Button>
        
        <Button
          onClick={() => createTestNotification('downvote')}
          disabled={isCreating.downvote}
          className="w-full justify-start"
          variant="outline"
        >
          {isCreating.downvote ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
          )}
          Create Downvote Notification
        </Button>
        
        <Button
          onClick={() => createTestNotification('comment')}
          disabled={isCreating.comment}
          className="w-full justify-start"
          variant="outline"
        >
          {isCreating.comment ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
          )}
          Create Comment Notification
        </Button>
        
        <div className="pt-2 border-t">
          <Button
            onClick={refetch}
            className="w-full justify-start"
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationTestPanel;
