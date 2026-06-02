'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function OperationsFeedbackPage() {
  const router = useRouter();

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operations Feedback</h1>
          <p className="text-gray-600 mt-1">Review shared feedback and route it to the right team</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shared Feedback Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                This view is the operations entry point for feedback. The detailed review tools live in the shared feedback workspace.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => router.push('/admin/feedback')}>Open Shared Feedback</Button>
                <Button variant="outline" onClick={() => router.push('/operations/dashboard')}>Back to Dashboard</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
