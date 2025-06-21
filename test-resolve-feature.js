/**
 * Simple test to verify the complaint resolution functionality
 * Run this after logging in and creating a complaint
 */

// Test getting user notifications to verify resolve notification was created
async function testGetNotifications() {
  try {
    const response = await fetch('http://localhost:5000/api/notifications', {
      credentials: 'include'
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Fetched notifications successfully!');
      console.log(`Total notifications: ${result.notifications.length}`);
      console.log(`Unread notifications: ${result.unreadCount}`);
      
      // Filter and show resolve notifications
      const resolveNotifications = result.notifications.filter(n => 
        n.type === 'complaint_status_change' && n.data?.status === 'resolved'
      );
      console.log(`Resolve notifications: ${resolveNotifications.length}`);
      
      resolveNotifications.forEach((notification, index) => {
        console.log(`\n--- Resolve Notification ${index + 1} ---`);
        console.log('Title:', notification.title);
        console.log('Message:', notification.message);
        console.log('Created At:', notification.createdAt);
        console.log('Read:', notification.read);
      });
      
      return result;
    } else {
      console.error('❌ Failed to fetch notifications:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return null;
  }
}

// Test the resolve complaint endpoint
async function testResolveComplaint(complaintId, resolution = "Issue has been fixed by maintenance team") {
  try {
    const response = await fetch(`http://localhost:5000/api/complaints/${complaintId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // Note: You need to be authenticated. Get token from browser localStorage or cookie
      },
      credentials: 'include',
      body: JSON.stringify({
        resolution: resolution
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Complaint resolved successfully!');
      console.log('Response:', result);
      console.log('Complaint Status:', result.complaint.status);
      console.log('Resolved At:', result.complaint.resolvedAt);
      console.log('Resolution Note:', result.complaint.resolution);
      return result;
    } else {
      console.error('❌ Failed to resolve complaint:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Error resolving complaint:', error);
    return null;
  }
}

// Test getting all complaints to see resolved status
async function testGetComplaints() {
  try {
    const response = await fetch('http://localhost:5000/api/complaints', {
      credentials: 'include'
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Fetched complaints successfully!');
      console.log(`Total complaints: ${result.complaints.length}`);
      
      // Filter and show resolved complaints
      const resolvedComplaints = result.complaints.filter(c => c.status === 'resolved');
      console.log(`Resolved complaints: ${resolvedComplaints.length}`);
      
      resolvedComplaints.forEach((complaint, index) => {
        console.log(`\n--- Resolved Complaint ${index + 1} ---`);
        console.log('Title:', complaint.title);
        console.log('Status:', complaint.status);
        console.log('Resolved At:', complaint.resolvedAt);
        console.log('Resolution:', complaint.resolution || 'No resolution note');
      });
      
      return result;
    } else {
      console.error('❌ Failed to fetch complaints:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching complaints:', error);
    return null;
  }
}

// Instructions for manual testing
console.log(`
🧪 Manual Testing Instructions for Complaint Resolution Feature:

1. Open your browser and go to http://localhost:3000
2. Log in to your account
3. Create a new complaint if you don't have any
4. Go to "My Complaints" section
5. Find your complaint and click the three-dot menu
6. Click "Mark as Resolved"
7. Add a resolution note (optional)
8. Click "Mark as Resolved" button
9. Verify the complaint shows green resolved indicator
10. Check that your resolved complaints count increased in profile

🔧 Programmatic Testing:
- Replace 'COMPLAINT_ID_HERE' with an actual complaint ID
- Run: testResolveComplaint('COMPLAINT_ID_HERE', 'Your resolution note')
- Run: testGetComplaints() to see all complaints including resolved ones
- Run: testGetNotifications() to verify resolution notification was created

✨ Expected Behavior:
- Only complaint authors can resolve their complaints
- Resolved complaints show green background with resolution info
- User's resolved complaint count increases
- Resolution date and note are saved and displayed
- Dropdown menu hides "Mark as Resolved" for already resolved complaints
- Notification is created when complaint is resolved
`);

// Export functions if using in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testResolveComplaint,
    testGetComplaints,
    testGetNotifications
  };
}
