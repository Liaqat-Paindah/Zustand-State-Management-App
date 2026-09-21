"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/stores/userAuth";
import { useRouter } from "next/navigation";

type BillingInterval = "monthly" | "yearly";

type PlanId = "standard" | "enterprise";

interface Plan {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "standard",
    name: "Standard",
    description: "Everything you need to build and grow your business.",
    monthlyPrice: 10,
    yearlyPrice: 99,
    features: [
      "Up to 5 team members",
      "10 active projects",
      "Basic analytics",
      "Unlimited file storage",
      "Email support",
      "API access",
    ],
  },

  {
    id: "enterprise",
    name: "Enterprise",
    description: "Advanced tools and support for growing organizations.",
    monthlyPrice: 25,
    yearlyPrice: 199,
    popular: true,

    features: [
      "Unlimited team members",
      "Unlimited projects",
      "Advanced analytics",
      "Unlimited storage",
      "Priority support",
      "Advanced API access",
      "Custom integrations",
      "Enterprise security",
    ],
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [billing, setBilling] = useState<BillingInterval>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async (plan: PlanId) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setLoadingPlan(plan);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing }),
      });
      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.message ?? "Unable to start checkout");
      }

      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout",
      );
      setLoadingPlan(null);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white px-4 py-24 text-slate-900 transition-colors dark:bg-[#050816] dark:text-white sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-sm bg-blue-500/10 blur-[120px] dark:bg-cyan-500/10" />

        <div className="absolute -left-32 top-1/3 h-72 w-72 rounded-sm bg-purple-500/10 blur-[100px]" />

        <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-sm bg-cyan-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-6xl">
            Choose the plan that{" "}
            <span className="bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              fits your needs
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
            Powerful tools for individuals, teams, and organizations. Upgrade
            whenever your business grows.
          </p>
        </div>

        {/* Billing Switch */}
        <div className="mt-8 flex justify-center">
          <div className="relative flex rounded-sm border border-slate-200 bg-slate-100 p-1.5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`relative rounded-sm px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                billing === "monthly"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`relative rounded-sm px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                billing === "yearly"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Yearly
              <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                SAVE 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-2">
          {plans.map((plan) => {
            const price =
              billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

            return (
              <div
                key={plan.id}
                className={`group relative rounded-sm p-px transition-all duration-500 hover:-translate-y-2 ${
                  plan.popular
                    ? "bg-linear-to-br from-cyan-500 via-blue-500 to-purple-600 shadow-md shadow-blue-500/20"
                    : "bg-slate-200 dark:bg-white/10"
                }`}
              >
                {/* Popular glow */}
                {plan.popular && (
                  <div className="absolute -inset-1 -z-10 rounded-sm bg-linear-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-xl" />
                )}

                <div className="relative h-full rounded-sm bg-white p-8 dark:bg-[#0b1020] lg:p-10">
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute right-6 top-6">
                      <div className="flex items-center gap-1.5 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20">
                        <Sparkles className="h-3.5 w-3.5" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="max-w-md">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm bg-linear-to-br from-cyan-500/10 to-blue-500/10 ring-1 ring-cyan-500/20">
                      {plan.id === "standard" ? (
                        <Zap className="h-6 w-6 text-cyan-500" />
                      ) : (
                        <ShieldCheck className="h-6 w-6 text-blue-500" />
                      )}
                    </div>

                    <h3 className="text-2xl font-bold">{plan.name}</h3>

                    <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mt-8">
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-bold tracking-tight">
                        ${price}
                      </span>

                      <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">
                        / {billing === "monthly" ? "month" : "year"}
                      </span>
                    </div>

                    {billing === "yearly" && (
                      <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                        Save with yearly billing
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={() => handleNext(plan.id)}
                    disabled={loadingPlan !== null}
                    className={`mt-8 flex w-full items-center justify-center gap-2 rounded-sm px-5 py-3.5 text-sm font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "bg-linear-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-sm shadow-blue-500/25 hover:scale-[1.02] hover:shadow-sm hover:shadow-blue-500/30"
                        : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    }`}
                  >
                    {loadingPlan === plan.id ? "Starting checkout..." : "Get started"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  {/* Divider */}
                  <div className="my-8 h-px bg-slate-200 dark:bg-white/10" />

                  {/* Features */}
                  <div>
                    <p className="mb-5 text-sm font-semibold">
                      Everything included:
                    </p>

                    <ul className="space-y-4">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          </span>

                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {/* Bottom trust section */}
        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            No hidden fees
          </div>

          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Cancel anytime
          </div>

          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Secure payments
          </div>
        </div>
      </div>
    </section>
  );
}
