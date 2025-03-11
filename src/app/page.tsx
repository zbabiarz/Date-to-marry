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
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left max-w-2xl mx-auto md:mx-0">
                <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
                  Your Personal
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-rose-700 mx-2">
                    Dating Advisor
                  </span>
                  by Robbie Brito
                </h1>

                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                  Navigate your relationships toward meaningful commitment with
                  personalized advice from AI trained on Robbie Brito's
                  expertise.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
                  <a
                    href={user ? "/dashboard" : "/sign-up"}
                    className="inline-flex items-center px-8 py-4 text-white bg-blue-800 rounded-lg hover:bg-blue-900 transition-colors text-lg font-medium"
                  >
                    Start Your Journey
                    <ArrowUpRight className="ml-2 w-5 h-5" />
                  </a>

                  <a
                    href="#pricing"
                    className="inline-flex items-center px-8 py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
                  >
                    View Pricing
                  </a>
                </div>
              </div>

              <div className="mt-8 md:mt-0 max-w-md">
                <img
                  src="https://storage.googleapis.com/msgsndr/NTKUB2advX9PS13kiwao/media/67ce5eb0c6d47cc65cd57fb4.png"
                  alt="Date To Marry Hero Image"
                  className="rounded-lg shadow-lg w-full h-auto"
                />
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
            <h2 className="text-3xl font-bold mb-4">Token Packages</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Purchase tokens to chat with your AI Dating Advisor
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
              {/* Basic Package */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <div className="text-3xl font-bold mb-1">$10</div>
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-blue-800 font-semibold">100</span>
                  <span className="text-gray-500">tokens</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">100 AI responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">10¢ per token</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">Tokens never expire</span>
                  </li>
                </ul>
                <a
                  href={user ? "/dashboard/tokens" : "/sign-up"}
                  className="block w-full py-3 px-4 bg-blue-800 hover:bg-blue-900 text-white text-center font-medium rounded-lg transition-colors"
                >
                  Get Started
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border-2 border-blue-500 overflow-hidden relative transform scale-105">
              {/* Popular Package */}
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-medium">
                Best Value
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Popular</h3>
                <div className="text-3xl font-bold mb-1">$25</div>
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-blue-800 font-semibold">300</span>
                  <span className="text-gray-500">tokens</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">300 AI responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">8.3¢ per token</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">20% savings</span>
                  </li>
                </ul>
                <a
                  href={user ? "/dashboard/tokens" : "/sign-up"}
                  className="block w-full py-3 px-4 bg-blue-800 hover:bg-blue-900 text-white text-center font-medium rounded-lg transition-colors"
                >
                  Get Started
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
              {/* Premium Package */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Premium</h3>
                <div className="text-3xl font-bold mb-1">$75</div>
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-blue-800 font-semibold">1000</span>
                  <span className="text-gray-500">tokens</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">1000 AI responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">7.5¢ per token</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">25% savings</span>
                  </li>
                </ul>
                <a
                  href={user ? "/dashboard/tokens" : "/sign-up"}
                  className="block w-full py-3 px-4 bg-blue-800 hover:bg-blue-900 text-white text-center font-medium rounded-lg transition-colors"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 max-w-3xl mx-auto bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">
              How tokens work:
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-800 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>New users get 3 free credits to try the service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-800 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Each message to the AI costs 1 token</span>
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-800 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Tokens never expire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-800 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Get 10 tokens for every $1 spent</span>
                  </li>
                </ul>
              </div>
            </div>
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
          <a
            href={user ? "/dashboard" : "/sign-up"}
            className="inline-flex items-center px-8 py-4 text-blue-800 bg-white rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium"
          >
            Start Now
            <ArrowUpRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
