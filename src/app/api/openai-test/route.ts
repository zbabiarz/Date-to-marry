import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(request: NextRequest) {
  try {
    // Create a new OpenAI client for this request
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Try a simple models list call to test the connection
    const models = await openai.models.list();

    // Return success with limited data
    return NextResponse.json({
      status: "success",
      message: "OpenAI connection successful",
      modelCount: models.data.length,
      firstModel: models.data[0]?.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("OpenAI test failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "OpenAI connection failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
