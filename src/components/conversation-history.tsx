"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { MessageCircle, Calendar, Search, Trash2 } from "lucide-react";
import { Input } from "./ui/input";

type Conversation = {
  id: string;
  title: string;
  preview: string;
  date: string;
  messageCount: number;
};

export default function ConversationHistory() {
  const [searchQuery, setSearchQuery] = useState("");

  // Sample conversation data
  const conversations: Conversation[] = [
    {
      id: "1",
      title: "First Date Advice",
      preview:
        "We discussed strategies for making a good impression on first dates...",
      date: "Oct 12, 2023",
      messageCount: 12,
    },
    {
      id: "2",
      title: "Relationship Communication",
      preview: "Tips for improving communication with your partner...",
      date: "Oct 8, 2023",
      messageCount: 18,
    },
    {
      id: "3",
      title: "Moving Toward Commitment",
      preview:
        "Discussing how to navigate the transition from casual dating to commitment...",
      date: "Oct 5, 2023",
      messageCount: 24,
    },
    {
      id: "4",
      title: "Dealing with Rejection",
      preview: "Strategies for handling rejection in a healthy way...",
      date: "Sep 28, 2023",
      messageCount: 9,
    },
  ];

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
            <Card
              key={conversation.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
        <Button className="w-full bg-blue-800 hover:bg-blue-900">
          Start New Conversation
        </Button>
      </div>
    </div>
  );
}
