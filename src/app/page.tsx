import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PricingCard from "@/components/pricing-card";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  Heart,
  MessageCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
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
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              How Robbie's AI Advisor Helps You
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get expert guidance on your relationship journey with our
              AI-powered dating advisor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Heart className="w-6 h-6" />,
                title: "Relationship Insights",
                description: "Personalized advice for your unique situation",
              },
              {
                icon: <MessageCircle className="w-6 h-6" />,
                title: "Conversation Guidance",
                description:
                  "Learn how to communicate effectively with your partner",
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "Dating Strategy",
                description:
                  "Proven approaches to build meaningful connections",
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "Commitment Focus",
                description: "Navigate your path toward lasting commitment",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-rose-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-blue-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Success Stories
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-900/30 p-6 rounded-lg">
              <p className="italic mb-4">
                "The AI advisor helped me understand what I was doing wrong in
                my relationships. Now I'm engaged to the love of my life!"
              </p>
              <div className="font-semibold">— Sarah T.</div>
            </div>
            <div className="bg-blue-900/30 p-6 rounded-lg">
              <p className="italic mb-4">
                "I was stuck in a cycle of bad dates until Robbie's AI gave me
                practical advice that actually worked."
              </p>
              <div className="font-semibold">— Michael R.</div>
            </div>
            <div className="bg-blue-900/30 p-6 rounded-lg">
              <p className="italic mb-4">
                "The personalized guidance helped me communicate better with my
                partner and take our relationship to the next level."
              </p>
              <div className="font-semibold">— Jennifer L.</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started with your AI dating advisor in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your account and choose a subscription plan that fits
                your needs
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Share Your Situation
              </h3>
              <p className="text-gray-600">
                Tell the AI about your relationship goals and current dating
                situation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Get Personalized Advice
              </h3>
              <p className="text-gray-600">
                Receive tailored guidance to help you navigate your relationship
                journey
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Invest in your relationship future with our affordable
              subscription options
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans?.map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-800 to-rose-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Dating Life?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands who have found meaningful relationships with Robbie
            Brito's expert guidance.
          </p>
          <Link
            href={user ? "/dashboard" : "/sign-up"}
            className="inline-flex items-center px-8 py-4 text-blue-800 bg-white rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium"
          >
            Start Now
            <ArrowUpRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
