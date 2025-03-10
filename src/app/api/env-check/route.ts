import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables without revealing actual values
    const envCheck = {
      OPENAI_API_KEY: {
        exists: !!process.env.OPENAI_API_KEY,
        length: process.env.OPENAI_API_KEY?.length || 0,
        prefix: process.env.OPENAI_API_KEY?.substring(0, 3) || "",
      },
      OPENAI_ASSISTANT_ID: {
        exists: !!process.env.OPENAI_ASSISTANT_ID,
        length: process.env.OPENAI_ASSISTANT_ID?.length || 0,
        prefix: process.env.OPENAI_ASSISTANT_ID?.substring(0, 3) || "",
      },
      NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: "ok",
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in env-check API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
