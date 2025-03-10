import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(request: NextRequest) {
  try {
    // Get API key directly from environment
    const apiKey = process.env.OPENAI_API_KEY;
    const assistantId = process.env.OPENAI_ASSISTANT_ID;

    if (!apiKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "API key is missing",
        },
        { status: 400 },
      );
    }

    if (!assistantId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Assistant ID is missing",
        },
        { status: 400 },
      );
    }

    // Create a direct OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Test the connection with a simple models list call
    const models = await openai.models.list();

    // Test the assistant exists
    const assistant = await openai.beta.assistants.retrieve(assistantId);

    return NextResponse.json({
      status: "success",
      message: "OpenAI connection successful",
      modelCount: models.data.length,
      assistant: {
        id: assistant.id,
        name: assistant.name,
        model: assistant.model,
      },
    });
  } catch (error) {
    console.error("Direct OpenAI test failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "OpenAI connection failed",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
