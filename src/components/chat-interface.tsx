"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, User, Sparkles, AlertCircle } from "lucide-react";
import { createClient } from "../../supabase/client";
import TokenDisplay from "./token-display";
import Link from "next/link";
import { FREE_PROMPTS_LIMIT } from "@/types/tokens";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const suggestedQuestions: SuggestedQuestion[] = [
    { id: "q1", text: "How do I know if they're interested in me?" },
    { id: "q2", text: "What are signs they want commitment?" },
    { id: "q3", text: "How do I communicate my relationship goals?" },
    { id: "q4", text: "When should I bring up exclusivity?" },
  ];

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

    // Add welcome message when component mounts
    if (messages.length === 0) {
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

    return () => {
      subscription.unsubscribe();
      transactionSubscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !userId || !canSendMessage) return;

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

    // Immediately update the UI to show one less credit
    if (freePromptsRemaining !== null && freePromptsRemaining > 0) {
      setFreePromptsRemaining((prev) => Math.max(0, prev - 1));
    }

    try {
      // Record token usage
      const { data } = await supabase.functions.invoke(
        "update-tokens-on-message",
        {
          body: { user_id: userId },
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

      // Simulate AI response after delay
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: getAIResponse(content),
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);
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

  // Placeholder function to simulate AI responses
  const getAIResponse = (userMessage: string): string => {
    const responses = [
      "Based on my experience, the key to a successful relationship is clear communication about your expectations and boundaries.",
      "I'd recommend focusing on building a strong emotional connection before discussing long-term commitment.",
      "It sounds like you might be at a crossroads in your relationship. Consider having an honest conversation about where you both see things going.",
      "Remember that healthy relationships require both partners to be equally invested. Are you feeling balanced in your current situation?",
      "Dating with intention means being clear about what you want. Have you shared your relationship goals with them?",
      "Sometimes the timing isn't right, even when the person seems perfect. Be patient with the process.",
      "Building a lasting relationship takes time and consistent effort from both people involved.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
