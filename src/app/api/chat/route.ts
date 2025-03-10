import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "../../../../supabase/server";
import { FREE_PROMPTS_LIMIT } from "@/types/tokens";

// CORS headers for API routes
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-custom-header, x-supabase-client",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, conversationHistory } =
      await request.json();

    // Validate the request
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // Get the current user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders },
      );
    }

    // Check if user has tokens available
    const { data: tokenData, error: tokenError } = await supabase
      .from("tokens")
      .select("balance, free_prompts_used")
      .eq("user_id", user.id)
      .single();

    if (tokenError && tokenError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Error checking token balance" },
        { status: 500, headers: corsHeaders },
      );
    }

    // Check token balance directly instead of using the function
    let tokenUsageData = null;

    // If no token record, or free prompts available, or balance > 0, proceed
    if (!tokenData) {
      // First time user, they get free prompts
      tokenUsageData = {
        freePrompt: true,
        remainingFree: FREE_PROMPTS_LIMIT - 1,
      };
    } else if (tokenData.free_prompts_used < FREE_PROMPTS_LIMIT) {
      // Still has free prompts
      tokenUsageData = {
        freePrompt: true,
        remainingFree: FREE_PROMPTS_LIMIT - tokenData.free_prompts_used - 1,
      };
    } else if (tokenData.balance >= 1) {
      // Has tokens
      tokenUsageData = {
        freePrompt: false,
        tokenBalance: tokenData.balance - 1,
      };
    } else {
      // No free prompts or tokens
      return NextResponse.json(
        { error: "Insufficient tokens" },
        { status: 402, headers: corsHeaders },
      );
    }

    // Process token usage via the Supabase function (but continue even if it fails)
    try {
      const { data, error } = await supabase.functions.invoke(
        "update-tokens-on-message",
        {
          body: { user_id: user.id },
          headers: {
            "Content-Type": "application/json",
            "x-custom-header": "value",
          },
        },
      );

      if (data) {
        tokenUsageData = data;
      }
    } catch (tokenError) {
      console.error("Token function error:", tokenError);
      // Continue anyway since we already checked the balance
    }

    // Get API key and assistant ID directly from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    const assistantId = process.env.OPENAI_ASSISTANT_ID;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500, headers: corsHeaders },
      );
    }

    if (!assistantId) {
      return NextResponse.json(
        { error: "OpenAI Assistant ID is not configured" },
        { status: 500, headers: corsHeaders },
      );
    }

    // Create a direct OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    try {
      // Create a new thread
      const thread = await openai.beta.threads.create();

      // Add the user message to the thread
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: message,
      });

      // Run the assistant on the thread
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId,
      });

      // Poll for the run to complete
      let runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id,
      );

      // Wait for the run to complete (with timeout)
      const startTime = Date.now();
      const timeout = 60000; // 60 seconds timeout

      while (
        runStatus.status !== "completed" &&
        runStatus.status !== "failed"
      ) {
        // Check for timeout
        if (Date.now() - startTime > timeout) {
          throw new Error("Assistant response timed out");
        }

        // Wait a bit before checking again
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

        // Handle failed runs
        if (runStatus.status === "failed") {
          throw new Error(
            `Run failed with reason: ${runStatus.last_error?.code || "unknown"}`,
          );
        }
      }

      // Get the assistant's response
      const messages = await openai.beta.threads.messages.list(thread.id);

      // Find the most recent assistant message
      const assistantMessages = messages.data.filter(
        (msg) => msg.role === "assistant",
      );
      if (assistantMessages.length === 0) {
        throw new Error("No assistant response found");
      }

      // Get the most recent message (first in the list)
      const latestMessage = assistantMessages[0];

      // Extract the text content and clean it up
      let responseText = "";
      for (const content of latestMessage.content) {
        if (content.type === "text") {
          responseText += content.text.value;
        }
      }

      // Clean up the response by removing transcription references
      responseText = responseText
        .replace(/\[\d+:\d+\*Transcribed video\.txt\]/g, "")
        .replace(/\[\d+:\d+\+Transcribed video\.txt\]/g, "")
        .replace(/\s+\[\d+:\d+\*Transcribed video\.txt\]\s+/g, " ")
        .replace(/\s+\[\d+:\d+\+Transcribed video\.txt\]\s+/g, " ");

      return NextResponse.json(
        {
          response: responseText,
          tokenData: tokenUsageData,
        },
        { headers: corsHeaders },
      );
    } catch (openaiError) {
      console.error("OpenAI error:", openaiError);
      return NextResponse.json(
        { error: `OpenAI error: ${openaiError.message}` },
        { status: 500, headers: corsHeaders },
      );
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
}
