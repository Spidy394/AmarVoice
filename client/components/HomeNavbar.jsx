'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import NotificationDropdown from '@/components/NotificationDropdown';
import { 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Shield,
  Award
} from 'lucide-react';
import { useTheme } from 'next-themes';

const HomeNavbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  const getUserInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };
  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 will-change-transform">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AV</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              AmarVoice
            </span>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <Moon className="h-4 w-4 transition-transform duration-200" />
              )}
            </Button>

            {/* Notifications */}
            <div className="relative">
              <NotificationDropdown />
            </div>            {/* User Dropdown */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                        {getUserInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
              
              <DropdownMenuContent 
                className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20" 
                align="end"
              >
                {/* User Info */}
                <div className="flex items-center space-x-3 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                      {getUserInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {user?.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        {user?.reputation || 0} Rep
                      </Badge>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator />

                {/* Menu Items */}
                <DropdownMenuItem className="cursor-pointer p-3">
                  <User className="mr-3 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer p-3">
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem 
                  className="cursor-pointer p-3 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
