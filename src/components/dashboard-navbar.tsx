"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  UserCircle,
  Home,
  Heart,
  MessageCircle,
  Settings,
  Coins,
  Calendar,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" prefetch className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-600" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-rose-700">
              Date To Marry
            </span>
          </Link>
        </div>
        <div className="flex gap-6 items-center">
          <a
            href="https://calendly.com/robbieblove/coaching"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-white bg-rose-600 px-3 py-1.5 rounded-md hover:bg-rose-700"
          >
            <Calendar className="h-4 w-4" />
            <span>Book a Call</span>
          </a>
          <Link
            href="/dashboard"
            className={`flex items-center gap-1 text-sm font-medium ${pathname === "/dashboard" ? "text-blue-800" : "text-gray-600 hover:text-blue-800"}`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link
            href="/dashboard/chat"
            className={`flex items-center gap-1 text-sm font-medium ${pathname === "/dashboard/chat" ? "text-blue-800" : "text-gray-600 hover:text-blue-800"}`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
          </Link>
          <Link
            href="/dashboard/history"
            className={`flex items-center gap-1 text-sm font-medium ${pathname === "/dashboard/history" ? "text-blue-800" : "text-gray-600 hover:text-blue-800"}`}
          >
            <Heart className="h-4 w-4" />
            <span>History</span>
          </Link>
          <Link
            href="/dashboard/tokens"
            className={`flex items-center gap-1 text-sm font-medium ${pathname === "/dashboard/tokens" ? "text-blue-800" : "text-gray-600 hover:text-blue-800"}`}
          >
            <Coins className="h-4 w-4" />
            <span>Tokens</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 w-full"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
