import { createClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");
  const error = requestUrl.searchParams.get("error");
  const error_code = requestUrl.searchParams.get("error_code");
  const error_description = requestUrl.searchParams.get("error_description");

  // Handle errors from Supabase auth
  if (error || error_code) {
    console.error("Auth error:", { error, error_code, error_description });

    // If the error is related to an expired link, redirect to a specific page
    if (error_code === "otp_expired") {
      return NextResponse.redirect(
        new URL(
          `/sign-in?error=${encodeURIComponent("Your confirmation link has expired. Please sign in again to receive a new link.")}`,
          requestUrl.origin,
        ),
      );
    }

    // For other errors, redirect to sign-in with the error
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=${encodeURIComponent(error_description || "Authentication error. Please try again.")}`,
        requestUrl.origin,
      ),
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error("Error exchanging code for session:", err);
      return NextResponse.redirect(
        new URL(
          `/sign-in?error=${encodeURIComponent("Authentication failed. Please try signing in again.")}`,
          requestUrl.origin,
        ),
      );
    }
  }

  // URL to redirect to after sign in process completes
  const redirectTo = redirect_to || "/dashboard";
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
