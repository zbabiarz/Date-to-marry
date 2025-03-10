import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import ChatInterface from "@/components/chat-interface";
import { ChatHistoryProvider } from "@/components/chat-history-provider";

export default async function ChatPage() {
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
      <main className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex-1 p-4">
          <ChatHistoryProvider>
            <ChatInterface />
          </ChatHistoryProvider>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
