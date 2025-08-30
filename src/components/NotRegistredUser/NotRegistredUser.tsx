import * as React from 'react';
import { Building2, Users, ArrowRight, CheckCircle } from 'lucide-react';

import MaxWidthWrapper from '../MaxWidthWrapper';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import Link from 'next/link';

function NotRegistredUser() {
  return (
    <MaxWidthWrapper className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-orange-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Business Access Required
            </h1>
            <p className="text-muted-foreground text-lg">
              You need to be registered with a business to access the dashboard
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create New Business */}
          <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Create New Business</CardTitle>
              <CardDescription>
                Start monitoring your own business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Set up business profile
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Invite team members
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Start tracking finances
                </div>
              </div>
              <Link href="/register-business">
                <Button className="w-full">
                  Register Business
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Join Existing Business */}
          <Card className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Join Existing Business</CardTitle>
              <CardDescription>Ask your manager to add you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Contact your manager
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Provide your email
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Get invited to join
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Need help? Contact your business administrator
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have a business yet?{' '}
            <Link
              href="/register-business"
              className="text-primary hover:underline"
            >
              Create one now
            </Link>{' '}
            to get started.
          </p>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

export default NotRegistredUser;
