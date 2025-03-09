import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import TokenPurchase from "@/components/token-purchase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coins, Clock, ArrowDown, ArrowUp } from "lucide-react";
import { FREE_PROMPTS_LIMIT } from "@/types/tokens";

export default async function TokensPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get token data
  const { data: tokenData } = await supabase
    .from("tokens")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Get recent transactions
  const { data: transactions } = await supabase
    .from("token_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const balance = tokenData?.balance || 0;
  const freePromptsUsed = tokenData?.free_prompts_used || 0;
  const freePromptsRemaining = FREE_PROMPTS_LIMIT - freePromptsUsed;

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Tokens</h1>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Balance</CardTitle>
                <CardDescription>Current token status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Coins className="h-6 w-6 text-blue-800" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{balance}</div>
                    <div className="text-sm text-gray-500">
                      available tokens
                    </div>
                  </div>
                </div>

                {freePromptsRemaining > 0 && (
                  <div className="bg-green-50 border border-green-100 rounded-md p-3 text-sm text-green-800">
                    You have{" "}
                    <span className="font-medium">{freePromptsRemaining}</span>{" "}
                    free {freePromptsRemaining === 1 ? "credit" : "credits"}{" "}
                    remaining
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest token transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          {transaction.transaction_type === "purchase" ? (
                            <ArrowUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-blue-800" />
                          )}
                          <div>
                            <div className="text-sm font-medium">
                              {transaction.description}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(
                                transaction.created_at,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`font-medium ${transaction.amount > 0 ? "text-green-600" : "text-blue-800"}`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                    <Clock className="h-8 w-8 mb-2 opacity-40" />
                    <p>No transactions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <TokenPurchase user={user} />
        </div>
      </main>
    </>
  );
}
