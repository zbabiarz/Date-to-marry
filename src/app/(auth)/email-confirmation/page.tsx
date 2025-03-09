import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signInAction } from "@/app/actions";
import Navbar from "@/components/navbar";
import { Mail, AlertCircle } from "lucide-react";

export default async function EmailConfirmation(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center space-y-4 text-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="h-8 w-8 text-blue-800" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Check Your Email
            </h1>
            <p className="text-sm text-muted-foreground">
              We've sent you a confirmation link. Please check your email to
              activate your account.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Important:</p>
              <p>
                If you don't see the email in your inbox, please check your spam
                or junk folder.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already confirmed your email?
              </p>
              <Link
                className="text-primary font-medium hover:underline transition-all text-sm"
                href="/sign-in"
              >
                Sign in to your account
              </Link>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email?
              </p>
              <Link
                className="text-primary font-medium hover:underline transition-all text-sm"
                href="/sign-up"
              >
                Try signing up again
              </Link>
            </div>
          </div>

          <FormMessage message={searchParams} />
        </div>
      </div>
    </>
  );
}
