import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    openaiKeyExists: !!process.env.OPENAI_API_KEY,
    openaiKeyFirstChars: process.env.OPENAI_API_KEY?.substring(0, 5) || "none",
    assistantIdExists: !!process.env.OPENAI_ASSISTANT_ID,
    assistantIdFirstChars:
      process.env.OPENAI_ASSISTANT_ID?.substring(0, 5) || "none",
    allEnvKeys: Object.keys(process.env)
      .filter((key) => !key.includes("SECRET") && !key.includes("KEY"))
      .sort(),
  });
}
