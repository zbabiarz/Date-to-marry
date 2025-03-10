import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check environment variables
    const envCheck = {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasAssistantId: !!process.env.OPENAI_ASSISTANT_ID,
      openAIKeyLength: process.env.OPENAI_API_KEY
        ? process.env.OPENAI_API_KEY.length
        : 0,
      assistantIdLength: process.env.OPENAI_ASSISTANT_ID
        ? process.env.OPENAI_ASSISTANT_ID.length
        : 0,
      nodeEnv: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: "ok",
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in debug API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
