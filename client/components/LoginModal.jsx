'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Shield, Wallet, Key, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';

const LoginModal = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleCivicLogin = async () => {
    try {
      setIsLoading(true);
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20 shadow-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to AmarVoice
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
            Join the community and make your voice heard. Secure authentication powered by Civic.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Features Preview */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Submit and track civic complaints
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Engage with your community
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-700 dark:text-purple-300">
                Verified and secure identity
              </span>
            </div>
          </div>

          {/* Civic Auth Card */}
          <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Civic Authentication</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Secure, decentralized identity verification
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Wallet className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Wallet Connected</p>
                </div>
                <div className="text-center">
                  <Key className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Verified Identity</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Privacy Protected</p>
                </div>
              </div>

              <Button
                onClick={handleCivicLogin}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Sign in with Civic
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your identity is verified through Civic's secure infrastructure.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;