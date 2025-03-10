import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(request: NextRequest) {
  try {
    // Get raw API key and Assistant ID for debugging
    const apiKey = process.env.OPENAI_API_KEY || "";
    const assistantId = process.env.OPENAI_ASSISTANT_ID || "";

    // Create a new OpenAI client with explicit API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Try to list models as a basic API test
    let modelsResult;
    try {
      const models = await openai.models.list();
      modelsResult = {
        success: true,
        count: models.data.length,
        firstModel: models.data[0]?.id,
      };
    } catch (modelError) {
      modelsResult = {
        success: false,
        error: modelError.message,
      };
    }

    // Try to retrieve the assistant
    let assistantResult;
    try {
      if (assistantId) {
        const assistant = await openai.beta.assistants.retrieve(assistantId);
        assistantResult = {
          success: true,
          id: assistant.id,
          name: assistant.name,
          model: assistant.model,
        };
      } else {
        assistantResult = {
          success: false,
          error: "No assistant ID provided",
        };
      }
    } catch (assistantError) {
      assistantResult = {
        success: false,
        error: assistantError.message,
      };
    }

    return NextResponse.json({
      apiKeyInfo: {
        exists: !!apiKey,
        length: apiKey.length,
        startsWithSk: apiKey.startsWith("sk-"),
        firstChars: apiKey.substring(0, 5),
        lastChars: apiKey.length > 5 ? apiKey.substring(apiKey.length - 5) : "",
      },
      assistantIdInfo: {
        exists: !!assistantId,
        length: assistantId.length,
        startsWithAsst: assistantId.startsWith("asst_"),
        firstChars: assistantId.substring(0, 5),
        lastChars:
          assistantId.length > 5
            ? assistantId.substring(assistantId.length - 5)
            : "",
      },
      modelsTest: modelsResult,
      assistantTest: assistantResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
