import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import {
  InfoIcon,
  UserCircle,
  MessageCircle,
  Heart,
  ArrowRight,
} from "lucide-react";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
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
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">
              Welcome to Your Dating Advisor
            </h1>
            <div className="bg-blue-50 text-sm p-4 px-5 rounded-lg text-blue-800 flex gap-2 items-center border border-blue-100">
              <InfoIcon size="16" />
              <span>
                Your personal AI dating advisor is ready to help you navigate
                your relationship journey
              </span>
            </div>
          </header>

          {/* Quick Actions */}
          <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <MessageCircle size={24} className="text-blue-800" />
                </div>
                <h2 className="font-semibold text-xl">
                  Chat with Your Advisor
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Get personalized dating advice and relationship guidance from
                your AI advisor.
              </p>
              <Link href="/dashboard/chat">
                <Button className="w-full bg-blue-800 hover:bg-blue-900">
                  Start Chatting <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-rose-100 p-2 rounded-full">
                  <Heart size={24} className="text-rose-600" />
                </div>
                <h2 className="font-semibold text-xl">Relationship Progress</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Track your relationship journey and see how you're progressing
                toward commitment.
              </p>
              <Button
                variant="outline"
                className="w-full border-blue-200 text-blue-800"
              >
                Coming Soon
              </Button>
            </div>
          </section>

          {/* User Profile Section */}
          <section className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <UserCircle size={48} className="text-blue-800" />
              <div>
                <h2 className="font-semibold text-xl">Your Profile</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">
                    {user.user_metadata?.full_name || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
