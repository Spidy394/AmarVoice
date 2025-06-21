'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/lib/auth-store';
import { cn } from '@/lib/utils';

const VotingButtons = ({ complaintId, initialUpvotes = 0, initialDownvotes = 0, className }) => {
  const [upvoteCount, setUpvoteCount] = useState(initialUpvotes);
  const [downvoteCount, setDownvoteCount] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(null); // null, 'upvote', or 'downvote'
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  // Fetch user's current vote status when component mounts
  useEffect(() => {
    if (user && complaintId) {
      fetchVoteStatus();
    }
  }, [user, complaintId]);

  const fetchVoteStatus = async () => {
    try {
      const response = await api.get(`/complaints/${complaintId}/vote-status`);
      const { upvoteCount, downvoteCount, userVote } = response.data;
      setUpvoteCount(upvoteCount);
      setDownvoteCount(downvoteCount);
      setUserVote(userVote);
    } catch (error) {
      console.error('Failed to fetch vote status:', error);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      const response = await api.post(`/complaints/${complaintId}/upvote`);
      const { upvoteCount, downvoteCount, userVote } = response.data;
      
      setUpvoteCount(upvoteCount);
      setDownvoteCount(downvoteCount);
      setUserVote(userVote);
    } catch (error) {
      console.error('Failed to upvote:', error);
      alert('Failed to upvote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownvote = async () => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      const response = await api.post(`/complaints/${complaintId}/downvote`);
      const { upvoteCount, downvoteCount, userVote } = response.data;
      
      setUpvoteCount(upvoteCount);
      setDownvoteCount(downvoteCount);
      setUserVote(userVote);
    } catch (error) {
      console.error('Failed to downvote:', error);
      alert('Failed to downvote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Upvote Button */}
      <div className="flex flex-col items-center">
        <Button
          variant={userVote === 'upvote' ? 'default' : 'ghost'}
          size="sm"
          onClick={handleUpvote}
          disabled={isLoading}
          className={cn(
            "p-2 h-8 w-8",
            userVote === 'upvote' 
              ? "bg-green-500 hover:bg-green-600 text-white" 
              : "hover:bg-green-50 hover:text-green-600"
          )}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <span className={cn(
          "text-xs font-medium",
          userVote === 'upvote' ? "text-green-600" : "text-gray-600"
        )}>
          {upvoteCount}
        </span>
      </div>

      {/* Downvote Button */}
      <div className="flex flex-col items-center">
        <Button
          variant={userVote === 'downvote' ? 'default' : 'ghost'}
          size="sm"
          onClick={handleDownvote}
          disabled={isLoading}
          className={cn(
            "p-2 h-8 w-8",
            userVote === 'downvote' 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "hover:bg-red-50 hover:text-red-600"
          )}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <span className={cn(
          "text-xs font-medium",
          userVote === 'downvote' ? "text-red-600" : "text-gray-600"
        )}>
          {downvoteCount}
        </span>
      </div>
    </div>
  );
};

export default VotingButtons;
