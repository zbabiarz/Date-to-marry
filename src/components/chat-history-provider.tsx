"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "../../supabase/client";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

type ChatHistoryContextType = {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  startNewConversation: () => void;
  addMessageToConversation: (message: Message) => void;
  loadConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
};

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(
  undefined,
);

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }
  return context;
}

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Check authentication and load conversations
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadConversations(user.id);
      }
    };

    checkAuth();
  }, [supabase]);

  // Load conversations from Supabase
  const loadConversations = async (userId: string) => {
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    if (data) {
      const formattedConversations: Conversation[] = await Promise.all(
        data.map(async (conv) => {
          // Load messages for each conversation
          const { data: messagesData, error: messagesError } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("timestamp", { ascending: true });

          if (messagesError) {
            console.error("Error loading messages:", messagesError);
            return {
              id: conv.id,
              title: conv.title,
              messages: [],
              createdAt: new Date(conv.created_at),
              updatedAt: new Date(conv.updated_at),
            };
          }

          const messages = messagesData.map((msg) => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp),
          }));

          return {
            id: conv.id,
            title: conv.title,
            messages,
            createdAt: new Date(conv.created_at),
            updatedAt: new Date(conv.updated_at),
          };
        }),
      );

      setConversations(formattedConversations);
    }
  };

  // Start a new conversation
  const startNewConversation = async () => {
    if (!userId) return;

    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to Supabase
    const { error } = await supabase.from("chat_conversations").insert({
      id: newConversation.id,
      user_id: userId,
      title: newConversation.title,
      created_at: newConversation.createdAt.toISOString(),
      updated_at: newConversation.updatedAt.toISOString(),
    });

    if (error) {
      console.error("Error creating conversation:", error);
      return;
    }

    setConversations([newConversation, ...conversations]);
    setCurrentConversation(newConversation);
  };

  // Add a message to the current conversation
  const addMessageToConversation = async (message: Message) => {
    if (!currentConversation || !userId) return;

    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, message],
      updatedAt: new Date(),
    };

    // Update conversation title if it's the first user message
    let title = currentConversation.title;
    if (
      currentConversation.title === "New Conversation" &&
      message.sender === "user"
    ) {
      title =
        message.content.length > 30
          ? `${message.content.substring(0, 30)}...`
          : message.content;
      updatedConversation.title = title;

      // Update conversation title in Supabase
      await supabase
        .from("chat_conversations")
        .update({
          title,
          updated_at: updatedConversation.updatedAt.toISOString(),
        })
        .eq("id", currentConversation.id);
    } else {
      // Just update the timestamp
      await supabase
        .from("chat_conversations")
        .update({ updated_at: updatedConversation.updatedAt.toISOString() })
        .eq("id", currentConversation.id);
    }

    // Save message to Supabase
    const { error } = await supabase.from("chat_messages").insert({
      id: message.id,
      conversation_id: currentConversation.id,
      content: message.content,
      sender: message.sender,
      timestamp: message.timestamp.toISOString(),
    });

    if (error) {
      console.error("Error saving message:", error);
      return;
    }

    // Update local state
    setCurrentConversation(updatedConversation);
    setConversations(
      conversations.map((conv) =>
        conv.id === currentConversation.id ? updatedConversation : conv,
      ),
    );
  };

  // Load a specific conversation
  const loadConversation = async (conversationId: string) => {
    const conversation = conversations.find(
      (conv) => conv.id === conversationId,
    );
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  // Delete a conversation
  const deleteConversation = async (conversationId: string) => {
    if (!userId) return;

    // Delete from Supabase
    const { error: messagesError } = await supabase
      .from("chat_messages")
      .delete()
      .eq("conversation_id", conversationId);

    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      return;
    }

    const { error: conversationError } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", conversationId);

    if (conversationError) {
      console.error("Error deleting conversation:", conversationError);
      return;
    }

    // Update local state
    setConversations(
      conversations.filter((conv) => conv.id !== conversationId),
    );
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
  };

  // Update conversation title
  const updateConversationTitle = async (
    conversationId: string,
    title: string,
  ) => {
    if (!userId) return;

    // Update in Supabase
    const { error } = await supabase
      .from("chat_conversations")
      .update({ title })
      .eq("id", conversationId);

    if (error) {
      console.error("Error updating conversation title:", error);
      return;
    }

    // Update local state
    setConversations(
      conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, title } : conv,
      ),
    );
    if (currentConversation?.id === conversationId) {
      setCurrentConversation({ ...currentConversation, title });
    }
  };

  return (
    <ChatHistoryContext.Provider
      value={{
        conversations,
        currentConversation,
        startNewConversation,
        addMessageToConversation,
        loadConversation,
        deleteConversation,
        updateConversationTitle,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}
