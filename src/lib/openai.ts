import OpenAI from "openai";

// Create a function to get a fresh OpenAI client each time
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({
    apiKey: apiKey,
  });
}

// Store threads by conversation ID to maintain context
const threadStore = new Map();

// For debugging
console.log("OpenAI API Key configured:", !!process.env.OPENAI_API_KEY);
console.log(
  "OpenAI Assistant ID configured:",
  !!process.env.OPENAI_ASSISTANT_ID,
);

export async function generateAIResponse(
  userMessage: string,
  conversationId: string,
  conversationHistory: any[] = [],
) {
  // Get a fresh OpenAI client for this request
  const openai = getOpenAIClient();

  // Get environment variables
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID;

  console.log("Function called with:", {
    messageLength: userMessage.length,
    conversationId,
    historyLength: conversationHistory.length,
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey?.substring(0, 3) || "none",
    hasAssistantId: !!assistantId,
    assistantIdPrefix: assistantId?.substring(0, 5) || "none",
  });

  try {
    // Use the refreshed variables
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured or not accessible");
    }

    if (!assistantId) {
      throw new Error(
        "OPENAI_ASSISTANT_ID is not configured or not accessible",
      );
    }

    // Always create a new thread for simplicity
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;
    console.log("Created new thread:", threadId);

    // Add the user message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage,
    });

    console.log("Creating run with assistant ID:", assistantId);

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // Poll for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    console.log("Initial run status:", runStatus.status);

    // Wait for the run to complete (with timeout)
    const startTime = Date.now();
    const timeout = 60000; // 60 seconds timeout (increased from 30)

    while (runStatus.status !== "completed" && runStatus.status !== "failed") {
      // Check for timeout
      if (Date.now() - startTime > timeout) {
        throw new Error("Assistant response timed out");
      }

      // Wait a bit before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      console.log("Updated run status:", runStatus.status);

      // Handle failed runs
      if (runStatus.status === "failed") {
        console.error("Run failed:", runStatus.last_error);
        throw new Error(
          `Run failed with reason: ${runStatus.last_error?.code || "unknown"}`,
        );
      }

      // Handle requires_action status (for function calling)
      if (runStatus.status === "requires_action") {
        console.log(
          "Run requires action, but no function handling is implemented",
        );
        // For now, we'll cancel the run since we don't have function handling
        await openai.beta.threads.runs.cancel(threadId, run.id);
        throw new Error("Assistant requires functions that aren't implemented");
      }
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(threadId);

    // Find the most recent assistant message
    const assistantMessages = messages.data.filter(
      (msg) => msg.role === "assistant",
    );
    if (assistantMessages.length === 0) {
      throw new Error("No assistant response found");
    }

    // Get the most recent message (first in the list)
    const latestMessage = assistantMessages[0];

    // Extract the text content
    let responseText = "";
    for (const content of latestMessage.content) {
      if (content.type === "text") {
        responseText += content.text.value;
      }
    }

    return responseText;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
  }
}
