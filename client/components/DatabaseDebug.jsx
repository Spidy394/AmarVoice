'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-store';
import { Database, Users, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const DatabaseDebug = () => {
  const { checkDatabaseStats } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await checkDatabaseStats();
      setStats(data);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to fetch database stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Debug Info
          <Button
            size="sm"
            variant="outline"
            onClick={fetchStats}
            disabled={loading}
            className="ml-auto"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats ? (
          <>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">Database Connected</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User Statistics
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Users: <Badge variant="secondary">{stats.totalUsers}</Badge>
                </p>
              </div>

              {stats.recentUsers && stats.recentUsers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Recent Users</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {stats.recentUsers.map((user, index) => (
                      <div
                        key={user._id || index}
                        className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded border"
                      >
                        <div className="font-mono text-gray-500 text-[10px]">
                          ID: {user._id}
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                          {user.username && <span> (@{user.username})</span>}
                        </div>
                        {user.email && (
                          <div className="text-gray-500">{user.email}</div>
                        )}
                        <div className="text-gray-400 text-[10px]">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {lastChecked && (
              <div className="text-xs text-gray-500 mt-4">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="w-5 h-5" />
            <span>Unable to connect to database</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseDebug;
