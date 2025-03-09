import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-customer-email",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { price_id, price_amount, user_id, return_url, token_purchase } =
      await req.json();

    if ((!price_id && !price_amount) || !user_id || !return_url) {
      throw new Error("Missing required parameters");
    }

    let session;

    // Handle token purchase (one-time payment)
    if (token_purchase && price_amount) {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "AI Dating Advisor Tokens",
                description: `${Math.floor((price_amount / 100) * 10)} tokens for your AI Dating Advisor`,
              },
              unit_amount: price_amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${return_url}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${return_url}?canceled=true`,
        customer_email: req.headers.get("X-Customer-Email"),
        metadata: {
          user_id,
          token_purchase: "true",
        },
      });
    }
    // Handle subscription purchase
    else {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: price_id,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${return_url}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${return_url}?canceled=true`,
        customer_email: req.headers.get("X-Customer-Email"),
        metadata: {
          user_id,
        },
      });
    }

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
