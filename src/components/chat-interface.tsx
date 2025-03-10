"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, User, Sparkles, AlertCircle, Plus } from "lucide-react";
import { createClient } from "../../supabase/client";
import TokenDisplay from "./token-display";
import Link from "next/link";
import { FREE_PROMPTS_LIMIT } from "@/types/tokens";
import { useRouter, useSearchParams } from "next/navigation";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

type SuggestedQuestion = {
  id: string;
  text: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [needsTokens, setNeedsTokens] = useState(false);
  const [freePromptsRemaining, setFreePromptsRemaining] = useState<
    number | null
  >(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] =
    useState<string>("New Conversation");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const suggestedQuestions: SuggestedQuestion[] = [
    { id: "q1", text: "How do I know if they're interested in me?" },
    { id: "q2", text: "What are signs they want commitment?" },
    { id: "q3", text: "How do I communicate my relationship goals?" },
    { id: "q4", text: "When should I bring up exclusivity?" },
  ];

  useEffect(() => {
    // Get conversation ID from URL if present
    const conversationParam = searchParams.get("conversation");
    if (conversationParam) {
      setConversationId(conversationParam);
      loadConversation(conversationParam);
    } else {
      // If no conversation ID, create a new one
      createNewConversation();
    }
  }, [searchParams]);

  const loadConversation = async (id: string) => {
    try {
      // First get the conversation details
      const { data: conversationData, error: conversationError } =
        await supabase
          .from("chat_conversations")
          .select("*")
          .eq("id", id)
          .single();

      if (conversationError) throw conversationError;
      if (!conversationData) {
        // If conversation doesn't exist, create a new one
        createNewConversation();
        return;
      }

      setConversationTitle(conversationData.title);

      // Then get all messages for this conversation
      const { data: messagesData, error: messagesError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", id)
        .order("timestamp", { ascending: true });

      if (messagesError) throw messagesError;

      if (messagesData && messagesData.length > 0) {
        const formattedMessages = messagesData.map((msg) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender as "user" | "ai",
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
      } else {
        // If no messages, add welcome message
        setMessages([
          {
            id: "welcome",
            content:
              "Hey hey! Robbie Brito here. How can I help you with your relationship journey today?",
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      // If there's an error, start a new conversation
      createNewConversation();
    }
  };

  const createNewConversation = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const newId = crypto.randomUUID();
      const now = new Date().toISOString();

      // Create a new conversation in the database
      const { error } = await supabase.from("chat_conversations").insert({
        id: newId,
        user_id: user.id,
        title: "New Conversation",
        created_at: now,
        updated_at: now,
      });

      if (error) throw error;

      setConversationId(newId);
      setConversationTitle("New Conversation");
      setMessages([
        {
          id: "welcome",
          content:
            "Hey hey! Robbie Brito here. How can I help you with your relationship journey today?",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);

      // Update URL without refreshing the page
      router.replace(`/dashboard/chat?conversation=${newId}`);
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  useEffect(() => {
    // Check user authentication and token status
    const checkUserAndTokens = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);

        // Check if user can send messages
        const { data: tokenData } = await supabase
          .from("tokens")
          .select("balance, free_prompts_used")
          .eq("user_id", user.id)
          .single();

        if (tokenData) {
          const freeRemaining =
            FREE_PROMPTS_LIMIT - (tokenData.free_prompts_used || 0);
          setFreePromptsRemaining(freeRemaining);

          if (freeRemaining > 0 || tokenData.balance > 0) {
            setCanSendMessage(true);
            setNeedsTokens(false);
          } else {
            setCanSendMessage(false);
            setNeedsTokens(true);
          }
        } else {
          // No token record yet, user still has free prompts
          setFreePromptsRemaining(FREE_PROMPTS_LIMIT);
          setCanSendMessage(true);
          setNeedsTokens(false);
        }
      } else {
        // Not logged in
        setUserId(null);
        setCanSendMessage(false);
      }
    };

    checkUserAndTokens();

    // Subscribe to token changes
    const subscription = supabase
      .channel("tokens-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tokens",
        },
        async (payload) => {
          const freeRemaining =
            FREE_PROMPTS_LIMIT - (payload.new.free_prompts_used || 0);
          setFreePromptsRemaining(freeRemaining);

          if (freeRemaining > 0 || payload.new.balance > 0) {
            setCanSendMessage(true);
            setNeedsTokens(false);
          } else {
            setCanSendMessage(false);
            setNeedsTokens(true);
          }
        },
      )
      .subscribe();

    // Subscribe to token transactions to ensure UI updates immediately
    const transactionSubscription = supabase
      .channel("token-transactions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "token_transactions",
        },
        async (payload) => {
          // When a new transaction is recorded, refresh token data
          checkUserAndTokens();
        },
      )
      .subscribe();

    // Subscribe to chat messages for this conversation
    const chatMessagesSubscription = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: conversationId
            ? `conversation_id=eq.${conversationId}`
            : undefined,
        },
        (payload) => {
          if (payload.new && payload.new.conversation_id === conversationId) {
            const newMessage = {
              id: payload.new.id,
              content: payload.new.content,
              sender: payload.new.sender as "user" | "ai",
              timestamp: new Date(payload.new.timestamp),
            };
            // Only add the message if it's not already in the list
            setMessages((prev) => {
              if (!prev.some((msg) => msg.id === newMessage.id)) {
                return [...prev, newMessage];
              }
              return prev;
            });
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      transactionSubscription.unsubscribe();
      chatMessagesSubscription.unsubscribe();
    };
  }, [supabase, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const updateConversationTitle = async (content: string) => {
    if (!conversationId || !userId || conversationTitle !== "New Conversation")
      return;

    // Use the first user message as the conversation title (truncated if needed)
    const newTitle =
      content.length > 30 ? `${content.substring(0, 30)}...` : content;

    try {
      const { error } = await supabase
        .from("chat_conversations")
        .update({
          title: newTitle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);

      if (error) throw error;
      setConversationTitle(newTitle);
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !userId || !canSendMessage || !conversationId)
      return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Update conversation title if it's the first user message
    updateConversationTitle(content);

    // Immediately update the UI to show one less credit
    if (freePromptsRemaining !== null && freePromptsRemaining > 0) {
      setFreePromptsRemaining((prev) => Math.max(0, prev - 1));
    }

    try {
      // Save user message to database
      const { error: messageError } = await supabase
        .from("chat_messages")
        .insert({
          id: userMessage.id,
          conversation_id: conversationId,
          content: userMessage.content,
          sender: userMessage.sender,
          timestamp: userMessage.timestamp.toISOString(),
        });

      if (messageError) throw messageError;

      // Update conversation timestamp
      const { error: conversationError } = await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      if (conversationError) throw conversationError;

      // Record token usage
      try {
        const { data } = await supabase.functions.invoke(
          "update-tokens-on-message",
          {
            body: { user_id: userId },
            headers: {
              "Content-Type": "application/json",
              "x-custom-header": "value",
            },
          },
        );

        // Update local state based on response
        if (data?.freePrompt !== undefined) {
          setFreePromptsRemaining(data.remainingFree);
        }

        if (
          data?.tokenBalance !== undefined &&
          data.tokenBalance === 0 &&
          data.freePrompt === false
        ) {
          setCanSendMessage(false);
          setNeedsTokens(true);
        }
      } catch (tokenError) {
        console.error("Token usage error:", tokenError);
        // Check if the error is about insufficient tokens
        if (
          tokenError.message?.includes("402") ||
          tokenError.message?.includes("Insufficient")
        ) {
          setCanSendMessage(false);
          setNeedsTokens(true);
          throw new Error("Insufficient tokens");
        }
      }

      // Get AI response from the API
      try {
        // Skip debug test in production to avoid unnecessary API calls
        if (process.env.NODE_ENV === "development") {
          try {
            const debugResponse = await fetch("/api/debug-openai");
            const debugData = await debugResponse.json();
            console.log("OpenAI Debug:", debugData);
          } catch (debugError) {
            console.warn("Debug test failed, continuing anyway:", debugError);
          }
        }

        // Get AI response
        const aiResponseContent = await getAIResponse(content);

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponseContent,
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsLoading(false);

        // Save AI response to database
        await supabase.from("chat_messages").insert({
          id: aiResponse.id,
          conversation_id: conversationId,
          content: aiResponse.content,
          sender: aiResponse.sender,
          timestamp: aiResponse.timestamp.toISOString(),
        });
      } catch (error) {
        console.error("Error processing AI response:", error);
        setIsLoading(false);

        // Show error message to user with more details in development
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            process.env.NODE_ENV === "development"
              ? `I'm sorry, I'm having trouble connecting right now. Error: ${error.message}`
              : "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setIsLoading(false);

      // Restore the credit if there was an error
      if (freePromptsRemaining !== null) {
        setFreePromptsRemaining((prev) => prev + 1);
      }

      // Handle token depletion
      if (error.message?.includes("insufficient tokens")) {
        setCanSendMessage(false);
        setNeedsTokens(true);
      }
    }
  };

  // Get AI response from the API using the Assistants API
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      if (!conversationId) {
        throw new Error("No conversation ID available");
      }

      // Check if user has tokens before making the API call
      if (needsTokens) {
        throw new Error("Insufficient tokens");
      }

      // Get the conversation history to provide context
      const conversationHistory = messages
        .filter((msg) => msg.id !== "welcome") // Filter out the welcome message
        .slice(-10); // Only use the last 10 messages for context

      // Use absolute URL to avoid CORS issues
      const apiUrl = window.location.origin + "/api/chat";
      console.log("Using API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          conversationHistory,
        }),
        credentials: "same-origin",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Chat header */}
      <div className="bg-blue-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h2 className="font-semibold">Robbie Brito AI</h2>
        </div>
        <div className="flex items-center gap-3">
          {userId && <TokenDisplay />}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
            onClick={createNewConversation}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
          <Link
            href="/dashboard/history"
            className="text-sm bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded-md transition-colors"
          >
            View History
          </Link>
        </div>
      </div>
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-full ${message.sender === "user" ? "bg-blue-100 ml-2" : "mr-2"}`}
                >
                  {message.sender === "user" ? (
                    <User className="h-4 w-4 text-blue-800" />
                  ) : (
                    <img
                      src="https://storage.googleapis.com/msgsndr/NTKUB2advX9PS13kiwao/media/67ccf09f04d6594fb6350f97.png"
                      alt="Robbie Brito"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  )}
                </div>
                <div
                  className={`p-3 rounded-lg ${message.sender === "user" ? "bg-blue-800 text-white" : "bg-gray-100 text-gray-800"}`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex">
                <div className="flex items-center justify-center h-8 w-8 rounded-full mr-2">
                  <img
                    src="https://storage.googleapis.com/msgsndr/NTKUB2advX9PS13kiwao/media/67ccf09f04d6594fb6350f97.png"
                    alt="Robbie Brito"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </div>
                <div className="p-3 rounded-lg bg-gray-100">
                  <div className="flex space-x-2">
                    <div
                      className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "600ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Suggested questions */}
      {messages.length < 3 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question.id}
                onClick={() => handleSendMessage(question.text)}
                className="px-3 py-1.5 bg-white text-sm text-blue-800 rounded-full border border-blue-200 hover:bg-blue-50 transition-colors"
                disabled={isLoading}
              >
                {question.text}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Token purchase notice */}
      {needsTokens && (
        <div className="p-4 bg-amber-50 border-t border-amber-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 mb-1">
                You've used all your free credits
              </h3>
              <p className="text-sm text-amber-700 mb-3">
                Purchase tokens to continue chatting with the AI Dating Advisor.
              </p>
              <Link href="/dashboard/tokens">
                <Button className="bg-blue-800 hover:bg-blue-900">
                  Purchase Tokens
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex gap-2"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={!userId ? "Sign in to chat" : "Type your message..."}
            className="flex-1"
            disabled={isLoading || !userId || !canSendMessage}
          />
          <Button
            type="submit"
            disabled={
              !inputValue.trim() || isLoading || !userId || !canSendMessage
            }
            className="bg-blue-800 hover:bg-blue-900"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        {!userId && (
          <div className="mt-3 text-center">
            <Link
              href="/sign-in"
              className="text-blue-800 hover:underline text-sm"
            >
              Sign in to chat with the AI Dating Advisor
            </Link>
          </div>
        )}
        {userId &&
          freePromptsRemaining !== null &&
          freePromptsRemaining > 0 && (
            <div className="mt-2 text-xs text-center text-gray-500">
              You have{" "}
              <span className="font-medium">{freePromptsRemaining}</span> free{" "}
              {freePromptsRemaining === 1 ? "credit" : "credits"} remaining
            </div>
          )}
      </div>
    </div>
  );
}
