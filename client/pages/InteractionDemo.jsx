'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VotingButtons from '@/components/VotingButtons';
import CommentsSection from '@/components/CommentsSection';

const InteractionDemo = () => {
  // Demo data
  const demoComplaint = {
    _id: 'demo-complaint-1',
    title: 'Poor road conditions on Main Street',
    upvoteCount: 15,
    downvoteCount: 3,
    comments: [
      {
        _id: 'comment-1',
        content: 'I completely agree! The potholes are getting worse every day.',
        author: {
          _id: 'user-1',
          name: 'John Doe',
          avatar: null,
          isVerified: true
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        _id: 'comment-2',
        content: 'This has been an issue for months. The local authorities need to take immediate action.',
        author: {
          _id: 'user-2',
          name: 'Jane Smith',
          avatar: null,
          isVerified: false
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      }
    ]
  };

  const handleCommentsUpdate = (updatedComments) => {
    console.log('Comments updated:', updatedComments);
    // In a real application, this would update the parent component's state
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">User Interaction Demo</h1>
      
      <div className="space-y-6">
        {/* Voting Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Voting System Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">{demoComplaint.title}</h3>
              <p className="text-gray-600 mb-4">
                Click the voting buttons below to upvote or downvote this complaint.
                The system prevents multiple votes from the same user and allows toggling votes.
              </p>
              
              <div className="flex items-center justify-between">
                <VotingButtons
                  complaintId={demoComplaint._id}
                  initialUpvotes={demoComplaint.upvoteCount}
                  initialDownvotes={demoComplaint.downvoteCount}
                />
                
                <div className="text-sm text-gray-500">
                  Demo complaint ID: {demoComplaint._id}
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Voting Features:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ Prevents multiple votes from same user</li>
                <li>✓ Allows toggling votes (click again to remove)</li>
                <li>✓ Automatically removes opposing vote when switching</li>
                <li>✓ Real-time vote count updates</li>
                <li>✓ Visual feedback for user's current vote</li>
                <li>✓ Updates author reputation automatically</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Comments Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Comments System Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Comments Features:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Add new comments with character limit</li>
                <li>✓ Edit your own comments</li>
                <li>✓ Delete your own comments (or complaint author can delete)</li>
                <li>✓ Real-time timestamp display</li>
                <li>✓ User verification badges</li>
                <li>✓ Proper user association and authentication</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">{demoComplaint.title}</h3>
              
              <CommentsSection
                complaintId={demoComplaint._id}
                comments={demoComplaint.comments}
                onCommentsUpdate={handleCommentsUpdate}
              />
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Voting Endpoints:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono space-y-1">
                  <div>POST /complaints/:id/upvote</div>
                  <div>POST /complaints/:id/downvote</div>
                  <div>GET /complaints/:id/vote-status</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Comment Endpoints:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono space-y-1">
                  <div>POST /complaints/:id/comments</div>
                  <div>PUT /complaints/:id/comments/:commentId</div>
                  <div>DELETE /complaints/:id/comments/:commentId</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Import Components:</h4>
                <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono">
                  <div>import VotingButtons from '@/components/VotingButtons';</div>
                  <div>import CommentsSection from '@/components/CommentsSection';</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. Use VotingButtons:</h4>
                <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono">
                  <div>&lt;VotingButtons</div>
                  <div>&nbsp;&nbsp;complaintId=&#123;complaint._id&#125;</div>
                  <div>&nbsp;&nbsp;initialUpvotes=&#123;complaint.upvoteCount&#125;</div>
                  <div>&nbsp;&nbsp;initialDownvotes=&#123;complaint.downvoteCount&#125;</div>
                  <div>/&gt;</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">3. Use CommentsSection:</h4>
                <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono">
                  <div>&lt;CommentsSection</div>
                  <div>&nbsp;&nbsp;complaintId=&#123;complaint._id&#125;</div>
                  <div>&nbsp;&nbsp;comments=&#123;complaint.comments&#125;</div>
                  <div>&nbsp;&nbsp;onCommentsUpdate=&#123;handleCommentsUpdate&#125;</div>
                  <div>/&gt;</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractionDemo;
