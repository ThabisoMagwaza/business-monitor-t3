import * as React from 'react';
import { Building2, CheckCircle } from 'lucide-react';

import { addBusiness } from '~/app/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import SubmitButton from '~/components/SubmitButton';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-[calc(1000px+1rem)] mx-auto px-4 pb-4 flex flex-col flex-1 h-full gap-4">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Register Your Business
            </h1>
            <p className="text-muted-foreground">
              Get started with business monitoring and analytics
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl">Business Information</CardTitle>
            <CardDescription>
              Enter your business details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addBusiness} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Business Name
                </Label>
                <Input
                  name="name"
                  id="name"
                  placeholder="Enter your business name"
                  className="h-11"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be the name displayed on your dashboard
                </p>
              </div>

              <div className="space-y-4 pt-4 flex justify-center">
                <SubmitButton>Create Business</SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">
            What you&apos;ll get:
          </h3>
          <div className="grid gap-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-sm">
                <p className="font-medium">Business Dashboard</p>
                <p className="text-muted-foreground">
                  Monitor income, expenses, and performance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-sm">
                <p className="font-medium">Team Management</p>
                <p className="text-muted-foreground">
                  Invite team members and manage access
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-sm">
                <p className="font-medium">Financial Analytics</p>
                <p className="text-muted-foreground">
                  Get insights and reports
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
