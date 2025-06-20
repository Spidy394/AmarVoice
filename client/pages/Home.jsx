'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-store';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomeNavbar from '@/components/HomeNavbar';
import ComplaintsFeed from '@/components/ComplaintsFeed';
import CreateComplaintModal from '@/components/CreateComplaintModal';
import ModernComplaintModal from '@/components/ModernComplaintModal';
import ProfileSetupModal from '@/components/ProfileSetupModal';
import UserProfile from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { Plus, Home as HomeIcon, User, Bell, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Home = () => {
  const { user, needsProfileSetup, completeProfileSetup } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <HomeNavbar />
        
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Welcome back, {user?.name || 'Community Member'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your voice matters. Track your complaints, engage with your community, and drive positive change.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit New Complaint
                </Button>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{user?.complaintsSubmitted || 0} Submitted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{user?.complaintsResolved || 0} Resolved</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{user?.reputation || 0} Reputation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content with Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Community Feed</span>
                <span className="sm:hidden">Feed</span>
              </TabsTrigger>
              <TabsTrigger value="my-complaints" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">My Complaints</span>
                <span className="sm:hidden">Mine</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
                <span className="sm:hidden">Search</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="mt-0">
              <ComplaintsFeed />
            </TabsContent>

            <TabsContent value="my-complaints" className="mt-0">
              <ComplaintsFeed showUserComplaints={true} />
            </TabsContent>

            <TabsContent value="search" className="mt-0">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Advanced Search
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Search and filter complaints by category, location, or keywords.
                </p>
                <p className="text-sm text-gray-400">Coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <UserProfile />
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Complaint Modal */}
        <ModernComplaintModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(complaint) => {
            console.log('New complaint submitted:', complaint);
            // Refresh the feed or update state as needed
          }}
        />        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="lg"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-xl"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* Profile Setup Modal */}
        <ProfileSetupModal
          isOpen={needsProfileSetup}
          onComplete={completeProfileSetup}
        />
      </div>
    </ProtectedRoute>
  );
};

export default Home;