'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AISuggestion from '@/components/AISuggestion';
import VotingButtons from '@/components/VotingButtons';
import CommentsSection from '@/components/CommentsSection';
import api from '@/lib/api';
import useAuthStore from '@/lib/auth-store';
// import { useToast } from '@/components/ui/toast';
import {
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Circle,
  MoreHorizontal,
  Shield,
  Trash2,
  Edit3,
  Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ComplaintsFeed = ({ showUserComplaints = false }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [generatingAI, setGeneratingAI] = useState({});  const [expandedComments, setExpandedComments] = useState({}); // Track expanded comments

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
    // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [complaintToEdit, setComplaintToEdit] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    urgency: '',
    location: { address: '' }
  });

  // Resolve state
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [complaintToResolve, setComplaintToResolve] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  
  const { user } = useAuthStore();
  // const { toast } = useToast();

  // Debug authentication state
  React.useEffect(() => {
    console.log('ComplaintsFeed - Auth state:', { user, isAuthenticated: !!user });
  }, [user]);

  useEffect(() => {
    fetchComplaints();
  }, [showUserComplaints]);

  const fetchComplaints = async (pageNum = 1) => {
    try {
      setLoading(true);
      const endpoint = showUserComplaints ? '/complaints/my-complaints' : '/complaints';
      const response = await api.get(`${endpoint}?page=${pageNum}&limit=10`);
      
      if (showUserComplaints) {
        setComplaints(response.data);
      } else {
        const { complaints: newComplaints, pagination } = response.data;
        if (pageNum === 1) {
          setComplaints(newComplaints);
        } else {
          setComplaints(prev => [...prev, ...newComplaints]);
        }
        setHasMore(pagination.hasNext);
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComplaints(nextPage);
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    };
    return colors[urgency] || colors.medium;
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: <Circle className="w-4 h-4 text-blue-500" />,
      'in-progress': <Clock className="w-4 h-4 text-orange-500" />,
      resolved: <CheckCircle className="w-4 h-4 text-green-500" />,
      closed: <CheckCircle className="w-4 h-4 text-gray-500" />
    };
    return icons[status] || icons.open;
  };

  const formatTimeAgo = (date) => {
    try {
      if (!date) return 'Recently';
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Recently';
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Recently';    }
  };
  const generateAISuggestion = async (complaintId) => {
    try {
      setGeneratingAI(prev => ({ ...prev, [complaintId]: true }));
      
      console.log('Generating AI suggestion for complaint:', complaintId);
      
      const response = await api.post(`/complaints/${complaintId}/ai-suggestion`);
      
      console.log('AI suggestion response:', response.data);
      
      // Update the complaint in the local state with the new AI suggestion
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint._id === complaintId 
            ? { ...complaint, aiSuggestion: response.data.aiSuggestion }
            : complaint
        )
      );
      
    } catch (error) {
      console.error('Failed to generate AI suggestion:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Show user-friendly error message
      alert(`Failed to generate AI suggestion: ${error.response?.data?.error || error.message}`);    } finally {
      setGeneratingAI(prev => ({ ...prev, [complaintId]: false }));
    }
  };  const handleDeleteComplaint = async () => {
    if (!complaintToDelete) return;
    
    try {
      setDeleting(true);
      console.log('Attempting to delete complaint:', complaintToDelete._id);
      
      const response = await api.delete(`/complaints/${complaintToDelete._id}`);
      console.log('Delete response:', response.data);
        // Remove the complaint from the local state
      setComplaints(prevComplaints => 
        prevComplaints.filter(complaint => complaint._id !== complaintToDelete._id)
      );
        console.log('Complaint deleted successfully');
      alert('Complaint deleted successfully');
      setDeleteDialogOpen(false);
      setComplaintToDelete(null);
    } catch (error) {
      console.error('Failed to delete complaint:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });      // More specific error messages
      if (error.response?.status === 401) {
        console.log('Authentication error - showing error message');
        alert('You need to be logged in to delete complaints');
      } else if (error.response?.status === 403) {
        console.log('Authorization error - showing error message');
        alert('You can only delete your own complaints');
      } else if (error.response?.status === 404) {
        console.log('Not found error - showing error message');
        alert('Complaint not found');
      } else {
        console.log('General error - showing error message');
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
        alert(`Failed to delete complaint: ${errorMessage}`);
      }
    } finally {
      setDeleting(false);
    }
  };
  const openDeleteDialog = (complaint) => {
    setComplaintToDelete(complaint);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (complaint) => {
    setComplaintToEdit(complaint);
    setEditForm({
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      urgency: complaint.urgency,
      location: { address: complaint.location?.address || '' }
    });
    setEditDialogOpen(true);  };

  const handleCommentsUpdate = (complaintId, updatedComments) => {
    setComplaints(prevComplaints =>
      prevComplaints.map(complaint =>
        complaint._id === complaintId
          ? { ...complaint, comments: updatedComments }
          : complaint
      )
    );
  };

  const toggleComments = (complaintId) => {
    setExpandedComments(prev => ({
      ...prev,
      [complaintId]: !prev[complaintId]
    }));
  };

  const handleEditComplaint = async () => {
    if (!complaintToEdit) return;
    
    try {
      setEditing(true);
      console.log('Attempting to edit complaint:', complaintToEdit._id);
      console.log('Edit form data:', editForm);
      
      const response = await api.put(`/complaints/${complaintToEdit._id}`, editForm);
      console.log('Edit response:', response.data);
      
      // Update the complaint in the local state
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint._id === complaintToEdit._id 
            ? { ...complaint, ...response.data }
            : complaint
        )
      );
      
      console.log('Complaint edited successfully');
      alert('Complaint updated successfully');
      setEditDialogOpen(false);
      setComplaintToEdit(null);
    } catch (error) {
      console.error('Failed to edit complaint:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      // More specific error messages
      if (error.response?.status === 401) {
        alert('You need to be logged in to edit complaints');
      } else if (error.response?.status === 403) {
        alert('You can only edit your own complaints');
      } else if (error.response?.status === 404) {
        alert('Complaint not found');
      } else {
        alert(`Failed to edit complaint: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setEditing(false);
    }
  };
    const openResolveDialog = (complaint) => {
    setComplaintToResolve(complaint);
    setResolutionNote('');
    setResolveDialogOpen(true);
  };

  const handleResolveComplaint = async () => {
    if (!complaintToResolve) return;
    
    try {
      setResolving(true);
      console.log('Attempting to resolve complaint:', complaintToResolve._id);
      console.log('Resolution note:', resolutionNote);
      
      const response = await api.patch(`/complaints/${complaintToResolve._id}/resolve`, {
        resolution: resolutionNote
      });
      console.log('Resolve response:', response.data);
      
      // Update the complaint in the local state
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint._id === complaintToResolve._id 
            ? { ...complaint, ...response.data.complaint }
            : complaint
        )
      );
      
      console.log('Complaint marked as resolved successfully');
      alert('Complaint marked as resolved successfully');
      setResolveDialogOpen(false);
      setComplaintToResolve(null);
      setResolutionNote('');
    } catch (error) {
      console.error('Failed to resolve complaint:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // More specific error messages
      if (error.response?.status === 401) {
        alert('You need to be logged in to resolve complaints');
      } else if (error.response?.status === 403) {
        alert('You can only resolve your own complaints');
      } else if (error.response?.status === 404) {
        alert('Complaint not found');
      } else if (error.response?.status === 400) {
        alert(error.response?.data?.error || 'This complaint is already resolved');
      } else {
        alert(`Failed to resolve complaint: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setResolving(false);
    }
  };

  const isUserComplaint = (complaint) => {
    const isOwner = user && complaint.author && complaint.author._id === user._id;
    console.log('Checking complaint ownership:', {
      user: user,
      userId: user?._id,
      complaintAuthor: complaint.author,
      complaintAuthorId: complaint.author?._id,
      isOwner: isOwner,
      showUserComplaints: showUserComplaints,
      willShowDropdown: isOwner || showUserComplaints
    });
    return isOwner;
  };

  const ComplaintCard = ({ complaint }) => (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {!complaint.isAnonymous && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={complaint.author?.avatar} alt={complaint.author?.name} />
                <AvatarFallback className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm">
                  {complaint.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">
                  {complaint.isAnonymous ? 'Anonymous User' : complaint.author?.name}
                </p>
                {complaint.author?.isVerified && (
                  <Shield className="w-4 h-4 text-blue-500" />
                )}
              </div>              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimeAgo(complaint.createdAt)}
                {complaint.isEdited && (
                  <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                    edited
                  </span>
                )}
              </p>
            </div>
          </div>            <div className="flex items-center gap-2">
            {getStatusIcon(complaint.status)}
            <Badge className={getUrgencyColor(complaint.urgency)}>
              {complaint.urgency}
            </Badge>
            {complaint.status === 'resolved' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                Resolved
              </Badge>
            )}{/* Show more options for user's own complaints */}
            {(isUserComplaint(complaint) || showUserComplaints) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>                <DropdownMenuContent align="end">
                  {complaint.status !== 'resolved' && (
                    <DropdownMenuItem 
                      className="text-green-600 focus:text-green-600"
                      onClick={() => openResolveDialog(complaint)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Resolved
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-blue-600 focus:text-blue-600"
                    onClick={() => openEditDialog(complaint)}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onClick={() => openDeleteDialog(complaint)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {complaint.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
              {complaint.description}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{complaint.location?.address}</span>
          </div>

          {/* Category */}
          <Badge variant="outline" className="w-fit">
            {complaint.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>          {/* Images */}
          {complaint.images && complaint.images.length > 0 && (
            <div className="flex gap-2 mt-3">
              {complaint.images.slice(0, 3).map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={image.url} 
                    alt={image.caption || 'Complaint image'}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  {index === 2 && complaint.images.length > 3 && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        +{complaint.images.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Resolution Information */}
          {complaint.status === 'resolved' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-300">
                  Resolved
                </span>
                {complaint.resolvedAt && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    on {new Date(complaint.resolvedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {complaint.resolution && (
                <p className="text-sm text-green-700 dark:text-green-300">
                  {complaint.resolution}
                </p>
              )}
            </div>
          )}

          {/* AI Suggestion - Only show in My Complaints section */}
          {showUserComplaints && (
            <AISuggestion 
              complaint={complaint}
              onGenerateAI={() => generateAISuggestion(complaint._id)}
              isGenerating={generatingAI[complaint._id] || false}
            />
          )}          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4">
              <VotingButtons
                complaintId={complaint._id}
                initialUpvotes={complaint.upvoteCount || 0}
                initialDownvotes={complaint.downvoteCount || 0}
              />
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-blue-600"
                onClick={() => toggleComments(complaint._id)}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                <span>{complaint.commentCount || complaint.comments?.length || 0}</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{complaint.views || 0} views</span>
            </div>
          </div>

          {/* Comments Section */}
          {expandedComments[complaint._id] && (
            <div className="mt-4 pt-4 border-t">
              <CommentsSection
                complaintId={complaint._id}
                comments={complaint.comments || []}
                onCommentsUpdate={(updatedComments) => 
                  handleCommentsUpdate(complaint._id, updatedComments)
                }
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading && complaints.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {complaints.length === 0 ? (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
              {showUserComplaints ? 'No Complaints Yet' : 'No Complaints Found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {showUserComplaints 
                ? 'You haven\'t submitted any complaints yet. Start by creating your first complaint!'
                : 'Be the first to submit a complaint and make your voice heard in the community.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}

          {hasMore && !showUserComplaints && (
            <div className="text-center py-4">
              <Button 
                onClick={loadMore} 
                disabled={loading}
                variant="outline"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{complaintToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteComplaint}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Complaint</DialogTitle>
            <DialogDescription>
              Make changes to your complaint. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                placeholder="Enter complaint title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                placeholder="Describe your complaint in detail"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={editForm.category} 
                onValueChange={(value) => setEditForm({...editForm, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="public-safety">Public Safety</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select 
                value={editForm.urgency} 
                onValueChange={(value) => setEditForm({...editForm, urgency: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location.address}
                onChange={(e) => setEditForm({
                  ...editForm, 
                  location: { ...editForm.location, address: e.target.value }
                })}
                placeholder="Enter location"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={editing}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleEditComplaint}
              disabled={editing}
            >
              {editing ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Resolve Complaint</DialogTitle>
            <DialogDescription>
              Mark this complaint as resolved. Optionally, add a resolution note.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resolution-note">Resolution Note</Label>
              <Textarea
                id="resolution-note"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Enter resolution note (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setResolveDialogOpen(false)}
              disabled={resolving}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleResolveComplaint}
              disabled={resolving}
            >
              {resolving ? 'Resolving...' : 'Mark as Resolved'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintsFeed;
