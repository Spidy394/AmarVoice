'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MessageCircle, MoreHorizontal, Edit3, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import useAuthStore from '@/lib/auth-store';
import { cn } from '@/lib/utils';

const CommentsSection = ({ 
  complaintId, 
  comments = [], 
  onCommentsUpdate,
  className 
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deletingComment, setDeletingComment] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuthStore();

  const handleSubmitComment = async () => {
    if (!user) {
      alert('Please log in to comment');
      return;
    }

    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post(`/complaints/${complaintId}/comments`, {
        content: newComment.trim()
      });

      // Add new comment to the list
      const updatedComments = [...comments, response.data];
      onCommentsUpdate?.(updatedComments);
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) {
      alert('Please enter comment content');
      return;
    }

    try {
      const response = await api.put(`/complaints/${complaintId}/comments/${commentId}`, {
        content: editContent.trim()
      });

      // Update the comment in the list
      const updatedComments = comments.map(comment =>
        comment._id === commentId ? response.data : comment
      );
      onCommentsUpdate?.(updatedComments);
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit comment:', error);
      alert('Failed to edit comment. Please try again.');
    }
  };

  const handleDeleteComment = async () => {
    if (!deletingComment) return;

    try {
      await api.delete(`/complaints/${complaintId}/comments/${deletingComment._id}`);

      // Remove the comment from the list
      const updatedComments = comments.filter(comment => 
        comment._id !== deletingComment._id
      );
      onCommentsUpdate?.(updatedComments);
      setShowDeleteDialog(false);
      setDeletingComment(null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const formatTimeAgo = (date) => {
    try {
      if (!date) return 'Recently';
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Recently';
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Recently';
    }
  };

  const canModifyComment = (comment) => {
    return user && (user._id === comment.author._id || user._id === comment.author);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Comments Header */}
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5 text-gray-500" />
        <span className="font-medium text-gray-700">
          Comments ({comments.length})
        </span>
      </div>

      {/* Add New Comment */}
      {user && (
        <div className="space-y-3">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-[80px] resize-none"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/1000 characters
                </span>
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-1" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="space-y-2">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={comment.author?.avatar} 
                    alt={comment.author?.name || 'User'} 
                  />
                  <AvatarFallback>
                    {comment.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {comment.author?.name || 'Anonymous User'}
                    </span>
                    {comment.author?.isVerified && (
                      <span className="text-blue-500 text-xs">✓</span>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                    {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>
                  
                  {editingComment === comment._id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] resize-none"
                        maxLength={1000}
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditComment(comment._id)}
                          disabled={!editContent.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingComment(null);
                            setEditContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>

                {/* Comment Actions */}
                {canModifyComment(comment) && editingComment !== comment._id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingComment(comment._id);
                          setEditContent(comment.content);
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDeletingComment(comment);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {comments.indexOf(comment) < comments.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommentsSection;
