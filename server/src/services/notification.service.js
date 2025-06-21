import Notification from '../model/notification.model.js';

class NotificationService {
  // Create a notification for upvote
  static async createUpvoteNotification(complaintId, complaintTitle, authorId, actorId, actorName) {
    try {
      // Don't notify if user votes on their own complaint
      if (authorId.toString() === actorId.toString()) return;

      const notification = new Notification({
        recipient: authorId,
        type: 'upvote',
        title: 'New Upvote',
        message: `${actorName} upvoted your complaint "${complaintTitle}"`,
        data: {
          complaintId,
          actorId,
          actorName
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating upvote notification:', error);
    }
  }

  // Create a notification for downvote
  static async createDownvoteNotification(complaintId, complaintTitle, authorId, actorId, actorName) {
    try {
      // Don't notify if user votes on their own complaint
      if (authorId.toString() === actorId.toString()) return;

      const notification = new Notification({
        recipient: authorId,
        type: 'downvote',
        title: 'New Downvote',
        message: `${actorName} downvoted your complaint "${complaintTitle}"`,
        data: {
          complaintId,
          actorId,
          actorName
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating downvote notification:', error);
    }
  }

  // Create a notification for comment
  static async createCommentNotification(complaintId, complaintTitle, authorId, actorId, actorName, commentId) {
    try {
      // Don't notify if user comments on their own complaint
      if (authorId.toString() === actorId.toString()) return;

      const notification = new Notification({
        recipient: authorId,
        type: 'comment',
        title: 'New Comment',
        message: `${actorName} commented on your complaint "${complaintTitle}"`,
        data: {
          complaintId,
          commentId,
          actorId,
          actorName
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating comment notification:', error);
    }
  }

  // Create a notification for complaint status change
  static async createStatusChangeNotification(complaintId, complaintTitle, authorId, newStatus) {
    try {
      const statusMessages = {
        'in-progress': 'Your complaint is now being processed',
        'resolved': 'Your complaint has been resolved',
        'closed': 'Your complaint has been closed'
      };

      const notification = new Notification({
        recipient: authorId,
        type: 'complaint_status_change',
        title: 'Complaint Status Updated',
        message: `${statusMessages[newStatus] || 'Your complaint status has been updated'}: "${complaintTitle}"`,
        data: {
          complaintId,
          status: newStatus
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating status change notification:', error);
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find({ recipient: userId })
        .populate('data.actorId', 'name avatar')
        .populate('data.complaintId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments({ recipient: userId });
      const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

      return {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCount: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        unreadCount
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { read: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count for a user
  static async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({ recipient: userId, read: false });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

export default NotificationService;
