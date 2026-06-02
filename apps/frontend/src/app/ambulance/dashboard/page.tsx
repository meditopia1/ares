'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { PageLoading } from '@/components/layout/page-loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AmbulanceDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <PageLoading message="Loading ambulance workspace..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ambulance Workspace</h1>
          <p className="text-gray-600 mt-1">
            This role is reserved for future rollout and is not active yet.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Not Enabled Yet</CardTitle>
            <CardDescription>
              The ambulance operator area is not part of the current live workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              If this role is activated later, this page will be expanded with the operational tools and queues.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
              <Button variant="outline" onClick={() => router.push('/')}>Homepage</Button>
            </div>
            {user && (
              <p className="text-xs text-gray-500">
                Signed in as {user.email}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
