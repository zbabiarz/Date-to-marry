"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Coins, CreditCard, Zap } from "lucide-react";
import { supabase } from "../../supabase/supabase";
import { User } from "@supabase/supabase-js";
import { TOKENS_PER_DOLLAR } from "@/types/tokens";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  popular?: boolean;
}

export default function TokenPurchase({ user }: { user: User | null }) {
  const [isLoading, setIsLoading] = useState(false);

  const tokenPackages: TokenPackage[] = [
    {
      id: "starter",
      name: "Starter",
      tokens: 100,
      price: 10,
    },
    {
      id: "popular",
      name: "Popular",
      tokens: 300,
      price: 25,
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      tokens: 1000,
      price: 75,
    },
  ];

  const handlePurchase = async (packageId: string, price: number) => {
    if (!user) {
      window.location.href = "/sign-in?redirect=dashboard";
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_amount: price * 100, // Convert to cents
            user_id: user.id,
            return_url: `${window.location.origin}/dashboard`,
            token_purchase: true,
          },
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

      if (error) {
        throw error;
      }

      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Purchase Tokens</h2>
        <p className="text-gray-600">
          Tokens are used to chat with the AI Dating Advisor. Each message costs
          1 token.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tokenPackages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative overflow-hidden ${pkg.popular ? "border-2 border-blue-500 shadow-xl" : ""}`}
          >
            {pkg.popular && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-medium">
                Best Value
              </div>
            )}
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-1 mt-1">
                  <Coins className="h-4 w-4 text-blue-800" />
                  <span className="text-xl font-bold">{pkg.tokens}</span>
                  <span className="text-sm">tokens</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${pkg.price}</div>
              <div className="text-sm text-gray-500 mt-1">
                ${((pkg.price / pkg.tokens) * 100).toFixed(1)}¢ per token
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-blue-800 mt-0.5" />
                  <span className="text-sm">{pkg.tokens} AI responses</span>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-blue-800 mt-0.5" />
                  <span className="text-sm">Secure payment via Stripe</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-blue-800 hover:bg-blue-900"
                onClick={() => handlePurchase(pkg.id, pkg.price)}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : `Buy ${pkg.tokens} Tokens`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
        <div className="font-medium mb-1">How tokens work:</div>
        <ul className="list-disc list-inside space-y-1">
          <li>New users get {3} free credits to try the service</li>
          <li>Each message to the AI costs 1 credit</li>
          <li>Tokens never expire</li>
          <li>Get {TOKENS_PER_DOLLAR} tokens for every $1 spent</li>
        </ul>
      </div>
    </div>
  );
}
