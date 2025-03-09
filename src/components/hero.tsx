import Link from "next/link";
import { ArrowUpRight, Check, Heart } from "lucide-react";
import { createClient } from "../../supabase/server";

export default async function Hero() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-rose-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              Your Personal
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-rose-700 mx-2">
                Dating Advisor
              </span>
              by Robbie Brito
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Navigate your relationships toward meaningful commitment with
              personalized advice from AI trained on Robbie Brito's expertise.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={user ? "/dashboard" : "/sign-up"}
                className="inline-flex items-center px-8 py-4 text-white bg-blue-800 rounded-lg hover:bg-blue-900 transition-colors text-lg font-medium"
              >
                Start Your Journey
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#pricing"
                className="inline-flex items-center px-8 py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
              >
                View Pricing
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <span>Expert relationship advice</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-800" />
                <span>Personalized guidance</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-800" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
