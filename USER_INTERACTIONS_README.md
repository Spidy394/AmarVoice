# User Interaction System - Complete Implementation

This implementation provides a full-featured user interaction system for posts/complaints including upvoting, downvoting, and commenting functionality with proper authentication, authorization, and best practices.

## Features Implemented

### 🗳️ Voting System
- **Upvote/Downvote functionality** with toggle capability
- **Single vote per user** - prevents multiple votes from the same user
- **Vote switching** - removes opposing vote when switching
- **Real-time vote count updates**
- **Visual feedback** for user's current vote status
- **Automatic reputation updates** for content authors

### 💬 Comments System
- **Add new comments** with content validation
- **Edit own comments** with timestamp tracking
- **Delete comments** (own comments or as complaint author)
- **Character limits** and input validation
- **Real-time timestamp display** with relative time formatting
- **User verification badges** and avatar display
- **Proper user association** and authentication

### 📊 Reputation System
- **Automatic reputation calculation** based on interactions
- **Point system**: +2 for upvotes, -1 for downvotes, +1 for comments received, +5 for resolved complaints
- **Reputation never goes below 0**
- **Updates triggered on vote changes**

## Backend Implementation

### Database Schema Updates

#### Comment Schema (Enhanced)
```javascript
const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxLength: 1000 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

#### Complaint Schema (Already exists)
```javascript
upvotes: [{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}],
downvotes: [{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}],
comments: [commentSchema]
```

### API Endpoints

#### Voting Endpoints
- `POST /complaints/:id/upvote` - Toggle upvote on complaint
- `POST /complaints/:id/downvote` - Toggle downvote on complaint  
- `GET /complaints/:id/vote-status` - Get user's current vote status

#### Comment Endpoints
- `POST /complaints/:id/comments` - Add new comment
- `PUT /complaints/:id/comments/:commentId` - Edit existing comment
- `DELETE /complaints/:id/comments/:commentId` - Delete comment

#### Enhanced Existing Endpoints
- `GET /complaints` - Now includes populated comment authors
- `GET /complaints/:id` - Includes view count increment and full comment population
- `GET /complaints/my-complaints` - Includes populated comment authors

### Key Backend Features

#### Authentication & Authorization
```javascript
// All voting and commenting endpoints require authentication
router.post('/:id/upvote', authMiddleware, async (req, res) => {
  // Implementation ensures only authenticated users can vote
});

// Comment deletion/editing restricted to comment author or complaint author
if (!comment.author.equals(userId) && !complaint.author.equals(userId)) {
  return res.status(403).json({ error: 'Not authorized' });
}
```

#### Vote Logic
```javascript
// Prevents multiple votes and handles vote switching
const existingUpvoteIndex = complaint.upvotes.findIndex(
  vote => vote.user.toString() === userId.toString()
);

// Remove opposing vote if present
if (existingDownvoteIndex !== -1) {
  complaint.downvotes.splice(existingDownvoteIndex, 1);
}

// Toggle current vote
if (existingUpvoteIndex !== -1) {
  complaint.upvotes.splice(existingUpvoteIndex, 1); // Remove
} else {
  complaint.upvotes.push({ user: userId, createdAt: new Date() }); // Add
}
```

#### Reputation Updates
```javascript
// Automatic reputation calculation triggered on vote changes
userSchema.methods.updateReputation = async function() {
  const userComplaints = await Complaint.find({ author: this._id });
  let reputation = 0;
  
  userComplaints.forEach(complaint => {
    reputation += (complaint.upvotes?.length || 0) * 2; // +2 per upvote
    reputation -= (complaint.downvotes?.length || 0) * 1; // -1 per downvote
    reputation += (complaint.comments?.length || 0) * 1; // +1 per comment
    if (complaint.status === 'resolved') reputation += 5; // +5 bonus
  });
  
  this.reputation = Math.max(0, reputation);
  await this.save();
};
```

## Frontend Implementation

### Components Created

#### VotingButtons Component
```jsx
<VotingButtons
  complaintId={complaint._id}
  initialUpvotes={complaint.upvoteCount || 0}
  initialDownvotes={complaint.downvoteCount || 0}
  className="optional-styling"
/>
```

**Features:**
- Fetches user's current vote status on mount
- Handles upvote/downvote with proper API calls
- Provides visual feedback for current vote state
- Prevents multiple rapid clicks during API calls
- Shows login prompt for unauthenticated users

#### CommentsSection Component
```jsx
<CommentsSection
  complaintId={complaint._id}
  comments={complaint.comments || []}
  onCommentsUpdate={(updatedComments) => 
    handleCommentsUpdate(complaint._id, updatedComments)
  }
  className="optional-styling"
/>
```

**Features:**
- Add new comments with character limit (1000 chars)
- Edit own comments with inline editing
- Delete comments with confirmation dialog
- Real-time timestamp formatting
- User avatar and verification badge display
- Proper error handling and user feedback

### Integration with ComplaintsFeed

The main ComplaintsFeed component has been updated to:

```jsx
// State for tracking expanded comments
const [expandedComments, setExpandedComments] = useState({});

// Handler for comment updates
const handleCommentsUpdate = (complaintId, updatedComments) => {
  setComplaints(prevComplaints =>
    prevComplaints.map(complaint =>
      complaint._id === complaintId
        ? { ...complaint, comments: updatedComments }
        : complaint
    )
  );
};

// Toggle comments visibility
const toggleComments = (complaintId) => {
  setExpandedComments(prev => ({
    ...prev,
    [complaintId]: !prev[complaintId]
  }));
};

// In the JSX:
<VotingButtons
  complaintId={complaint._id}
  initialUpvotes={complaint.upvoteCount || 0}
  initialDownvotes={complaint.downvoteCount || 0}
/>

<Button onClick={() => toggleComments(complaint._id)}>
  <MessageCircle className="w-4 h-4 mr-1" />
  <span>{complaint.commentCount || complaint.comments?.length || 0}</span>
</Button>

{expandedComments[complaint._id] && (
  <CommentsSection
    complaintId={complaint._id}
    comments={complaint.comments || []}
    onCommentsUpdate={(updatedComments) => 
      handleCommentsUpdate(complaint._id, updatedComments)
    }
  />
)}
```

## Security Features

### Input Validation
- Comment content validation (required, max 1000 chars)
- XSS prevention through proper text handling
- SQL injection prevention through Mongoose ODM

### Authorization Checks
- Vote endpoints require authentication
- Comment editing restricted to comment author
- Comment deletion allowed for comment author or complaint author
- Proper error messages for unauthorized access

### Rate Limiting Considerations
- Vote toggling prevents rapid clicking during API calls
- Comment submission disabled during processing
- Proper loading states to prevent duplicate requests

## Usage Examples

### Basic Integration
```jsx
import VotingButtons from '@/components/VotingButtons';
import CommentsSection from '@/components/CommentsSection';

function ComplaintCard({ complaint }) {
  const [comments, setComments] = useState(complaint.comments);
  
  return (
    <div>
      <h3>{complaint.title}</h3>
      <p>{complaint.description}</p>
      
      <VotingButtons
        complaintId={complaint._id}
        initialUpvotes={complaint.upvoteCount}
        initialDownvotes={complaint.downvoteCount}
      />
      
      <CommentsSection
        complaintId={complaint._id}
        comments={comments}
        onCommentsUpdate={setComments}
      />
    </div>
  );
}
```

### Advanced Integration with State Management
```jsx
// Use with global state management (Redux, Zustand, etc.)
const handleCommentsUpdate = useCallback((complaintId, updatedComments) => {
  dispatch(updateComplaintComments({ complaintId, comments: updatedComments }));
}, [dispatch]);

const handleVoteUpdate = useCallback((complaintId, voteData) => {
  dispatch(updateComplaintVotes({ complaintId, ...voteData }));
}, [dispatch]);
```

## Performance Optimizations

### Client-Side
- Debounced API calls for voting
- Optimistic UI updates
- Memoized components to prevent unnecessary re-renders
- Lazy loading of comments (expandable sections)

### Server-Side
- Database indexes on frequently queried fields
- Populated queries to minimize database calls
- Efficient reputation calculation
- Proper error handling to prevent cascading failures

## Testing the Implementation

### Manual Testing Steps
1. **Voting System:**
   - Login as different users
   - Try upvoting/downvoting same complaint
   - Verify vote counts update correctly
   - Test vote switching (upvote → downvote)
   - Check reputation updates for complaint authors

2. **Comments System:**
   - Add comments as authenticated user
   - Edit your own comments
   - Try editing others' comments (should fail)
   - Delete your own comments
   - Test character limit validation

3. **Authentication:**
   - Test all features without login (should prompt/fail gracefully)
   - Verify proper error messages
   - Check authorization for different user roles

### API Testing with cURL
```bash
# Upvote a complaint
curl -X POST http://localhost:3000/api/complaints/COMPLAINT_ID/upvote \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add a comment
curl -X POST http://localhost:3000/api/complaints/COMPLAINT_ID/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a test comment"}'

# Edit a comment
curl -X PUT http://localhost:3000/api/complaints/COMPLAINT_ID/comments/COMMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated comment content"}'
```

## Deployment Considerations

### Environment Variables
- Ensure proper authentication middleware configuration
- Database connection strings for production
- CORS settings for client-server communication

### Database Migrations
- The comment schema update requires migration if existing data
- Reputation calculation may need to be run once for existing users
- Index creation for performance optimization

### Monitoring
- Track API response times for voting/commenting endpoints
- Monitor reputation calculation performance
- Set up alerts for failed authentication attempts

## Future Enhancements

### Potential Features
- **Nested comments/replies** - Add parent comment references
- **Comment voting** - Allow upvoting/downvoting individual comments
- **Rich text comments** - Support for markdown or rich text formatting
- **Comment moderation** - Admin tools for managing inappropriate content
- **Real-time updates** - WebSocket integration for live updates
- **Comment sorting** - Sort by newest, oldest, most upvoted
- **Comment search** - Search within comments
- **User mention system** - @username tagging with notifications

### Scalability Improvements
- **Pagination for comments** - Load comments in batches
- **Caching layer** - Redis for vote counts and comment caching
- **Queue system** - Background processing for reputation updates
- **CDN integration** - For user avatars and images

This implementation provides a robust, scalable foundation for user interactions that follows modern web development best practices and can be easily extended with additional features.
