'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-store';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AuthDebugger = () => {
  const { user, isAuthenticated, checkAuth } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});

  const runDebugTests = async () => {
    const results = {};
    
    try {
      // Test 1: Check auth status
      console.log('Testing auth status...');
      const authResponse = await api.get('/auth/check');
      results.authCheck = { success: true, data: authResponse.data };
    } catch (error) {
      results.authCheck = { success: false, error: error.message };
    }

    try {
      // Test 2: Get user info
      console.log('Testing user info...');
      const userResponse = await api.get('/auth/user');
      results.userInfo = { success: true, data: userResponse.data };
    } catch (error) {
      results.userInfo = { success: false, error: error.message };
    }

    try {
      // Test 3: Test complaint submission with minimal data
      console.log('Testing complaint submission...');
      const complaintData = {
        title: 'Debug Test Complaint',
        description: 'This is a test complaint for debugging purposes',
        category: 'infrastructure',
        location: {
          address: 'Test Address'
        }
      };
      
      const complaintResponse = await api.post('/complaints', complaintData);
      results.complaintSubmission = { success: true, data: complaintResponse.data };
    } catch (error) {
      results.complaintSubmission = { 
        success: false, 
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      };
    }

    setTestResults(results);
  };

  useEffect(() => {
    setDebugInfo({
      user,
      isAuthenticated,
      timestamp: new Date().toISOString()
    });
  }, [user, isAuthenticated]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current Auth State:</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          
          <Button onClick={runDebugTests} className="w-full">
            Run Debug Tests
          </Button>
          
          {Object.keys(testResults).length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <div className="space-y-3">
                {Object.entries(testResults).map(([test, result]) => (
                  <div key={test} className="border rounded p-3">
                    <h4 className="font-medium mb-1 capitalize">
                      {test.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      Status: {result.success ? 'SUCCESS' : 'FAILED'}
                    </div>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs mt-2 overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebugger;
