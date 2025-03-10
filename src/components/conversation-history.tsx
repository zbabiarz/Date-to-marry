"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  MessageCircle,
  Calendar,
  Search,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Input } from "./ui/input";
import { createClient } from "../../supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Conversation = {
  id: string;
  title: string;
  preview: string;
  date: string;
  messageCount: number;
  updatedAt: Date;
};

export default function ConversationHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/sign-in");
          return;
        }

        // Fetch conversations
        const { data: conversationsData, error: conversationsError } =
          await supabase
            .from("chat_conversations")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });

        if (conversationsError) {
          throw conversationsError;
        }

        // For each conversation, get the messages to create a preview
        const conversationsWithPreview = await Promise.all(
          conversationsData.map(async (conv) => {
            const { data: messagesData, error: messagesError } = await supabase
              .from("chat_messages")
              .select("*")
              .eq("conversation_id", conv.id)
              .order("timestamp", { ascending: false })
              .limit(5);

            if (messagesError) {
              console.error("Error fetching messages:", messagesError);
              return {
                id: conv.id,
                title: conv.title,
                preview: "No messages",
                date: new Date(conv.updated_at).toLocaleDateString(),
                messageCount: 0,
                updatedAt: new Date(conv.updated_at),
              };
            }

            // Get the last user message for the preview
            const userMessage = messagesData.find(
              (msg) => msg.sender === "user",
            );
            const preview = userMessage
              ? userMessage.content.length > 60
                ? `${userMessage.content.substring(0, 60)}...`
                : userMessage.content
              : "No messages";

            return {
              id: conv.id,
              title: conv.title,
              preview,
              date: new Date(conv.updated_at).toLocaleDateString(),
              messageCount: messagesData.length,
              updatedAt: new Date(conv.updated_at),
            };
          }),
        );

        setConversations(conversationsWithPreview);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to changes in conversations
    const conversationsSubscription = supabase
      .channel("chat-history-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_conversations",
        },
        () => {
          fetchConversations();
        },
      )
      .subscribe();

    return () => {
      conversationsSubscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      // First delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from("chat_messages")
        .delete()
        .eq("conversation_id", id);

      if (messagesError) throw messagesError;

      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from("chat_conversations")
        .delete()
        .eq("id", id);

      if (conversationError) throw conversationError;

      // Update local state
      setConversations(conversations.filter((conv) => conv.id !== id));
    } catch (err) {
      console.error("Error deleting conversation:", err);
      setError("Failed to delete conversation");
    }
  };

  const handleStartNewConversation = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const newConversationId = crypto.randomUUID();
      const now = new Date().toISOString();

      // Create a new conversation in the database
      const { error } = await supabase.from("chat_conversations").insert({
        id: newConversationId,
        user_id: user.id,
        title: "New Conversation",
        created_at: now,
        updated_at: now,
      });

      if (error) throw error;

      // Redirect to chat with the new conversation ID
      router.push(`/dashboard/chat?conversation=${newConversationId}`);
    } catch (err) {
      console.error("Error creating new conversation:", err);
      setError("Failed to create new conversation");
    }
  };

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-4 h-full flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-4 h-full flex flex-col items-center justify-center">
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-500">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Conversation History</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <Link
              href={`/dashboard/chat?conversation=${conversation.id}`}
              key={conversation.id}
            >
              <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-blue-800">
                      {conversation.title}
                    </h3>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {conversation.date}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {conversation.preview}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {conversation.messageCount} messages
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) =>
                        handleDeleteConversation(conversation.id, e)
                      }
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No conversations found</p>
            <p className="text-sm">Start a new chat to get advice</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Button
          className="w-full bg-blue-800 hover:bg-blue-900"
          onClick={handleStartNewConversation}
        >
          Start New Conversation
        </Button>
      </div>
    </div>
  );
}
