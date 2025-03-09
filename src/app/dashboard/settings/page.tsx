import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCircle, Bell, Shield, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-500">
              Manage your account preferences and subscription
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg border shadow-sm p-4 sticky top-8">
                <nav className="flex flex-col space-y-1">
                  <a
                    href="#profile"
                    className="px-3 py-2 rounded-md bg-blue-50 text-blue-800 font-medium flex items-center gap-2"
                  >
                    <UserCircle className="h-4 w-4" />
                    Profile
                  </a>
                  <a
                    href="#notifications"
                    className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                  </a>
                  <a
                    href="#privacy"
                    className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Privacy & Security
                  </a>
                  <a
                    href="#billing"
                    className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </a>
                </nav>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card id="profile">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      defaultValue={user.user_metadata?.full_name || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue={user.email} disabled />
                    <p className="text-xs text-gray-500">
                      Your email address cannot be changed
                    </p>
                  </div>
                  <Button className="bg-blue-800 hover:bg-blue-900">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card id="notifications">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">
                        Receive emails about your account activity
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Chat Summaries</p>
                      <p className="text-sm text-gray-500">
                        Get weekly summaries of your conversations
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dating Tips</p>
                      <p className="text-sm text-gray-500">
                        Receive occasional dating advice from Robbie
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card id="privacy">
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>
                    Manage your privacy and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data Storage</p>
                      <p className="text-sm text-gray-500">
                        Store conversation history for personalized advice
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Change Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="New password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button className="bg-blue-800 hover:bg-blue-900">
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card id="billing">
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>
                    Manage your subscription and payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="font-medium text-blue-800">
                      Current Plan: Premium
                    </p>
                    <p className="text-sm text-blue-700">
                      Your subscription renews on October 15, 2023
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline">Update Payment Method</Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
