'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  MapPin, 
  Calendar, 
  Shield, 
  Award, 
  TrendingUp,
  FileText,
  CheckCircle,
  Edit,
  Camera,
  Mail,
  Wallet
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import DatabaseDebug from './DatabaseDebug';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);const [editData, setEditData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || ''
  });

  // Safe date formatting function
  const formatSafeDate = (dateValue) => {
    try {
      if (!dateValue) return 'Recently';
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Recently';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Recently';
    }
  };  const handleSave = async () => {
    try {
      console.log('Updating profile with data:', editData);
      
      const response = await api.put('/auth/profile', editData);
      
      console.log('Profile update response:', response.data);
      
      if (response.data.user) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        throw new Error('No user data received from server');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    }
  };
  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      username: user?.username || '',
      bio: user?.bio || '',
      location: user?.location || ''
    });
    setIsEditing(false);
  };

  const getUserInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-2xl">
                  {getUserInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800"
                variant="outline"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-4">                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/50 dark:bg-gray-800/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editData.username}
                      onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value.toLowerCase() }))}
                      className="bg-white/50 dark:bg-gray-800/50"
                      placeholder="Enter a unique username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editData.bio}
                      onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      className="bg-white/50 dark:bg-gray-800/50"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editData.location}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Your city, state"
                      className="bg-white/50 dark:bg-gray-800/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">Save</Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        {user?.name}
                        {user?.isVerified && (
                          <Shield className="w-5 h-5 text-blue-500" />
                        )}
                      </h2>
                      {user?.username && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          @{user.username}
                        </p>
                      )}
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {user?.bio || 'No bio available'}
                      </p>
                    </div>
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                    {user?.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user?.walletAddress && (
                      <div className="flex items-center gap-1">
                        <Wallet className="w-4 h-4" />
                        <span className="font-mono text-xs">
                          {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatSafeDate(user?.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      <Award className="w-3 h-3 mr-1" />
                      {user?.reputation || 0} Reputation
                    </Badge>
                    {user?.isVerified && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Complaints Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {user?.complaintsSubmitted || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              +2 this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Complaints Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {user?.complaintsResolved || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              +1 this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Community Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {user?.reputation || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Reputation points
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                No recent activity to display
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Receive updates about your complaints
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Privacy Settings</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Control who can see your profile
                </p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Connected Wallet</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {user?.walletAddress ? 'Wallet connected via Civic' : 'No wallet connected'}
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                {user?.walletAddress ? 'Connected' : 'Connect'}
              </Button>
            </div>          </div>
        </CardContent>
      </Card>

      {/* Database Debug Info (Development) */}
      {process.env.NODE_ENV === 'development' && <DatabaseDebug />}
    </div>
  );
};

export default UserProfile;
