"use client";

import { useState } from "react";
import { PricingPlan } from "@/lib/api";
import { Check } from "lucide-react";

interface PricingSectionProps {
  plans: PricingPlan[];
}

export function PricingSection({ plans }: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  if (!plans || plans.length === 0) {
    return (
      <section id="pricing" className="py-20 border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Simple, predictable pricing
          </h2>
          <div className="mt-8 rounded-lg border border-border bg-surface p-8 max-w-md mx-auto text-sm text-ink-muted">
            Pricing plans are being updated. Please check back shortly.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 md:py-28 border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Simple, predictable pricing
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            All plans include passive time tracking and workload analytics. Choose the plan that fits your squad size.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-2 flex items-center gap-3 text-xs">
            <span className={`font-medium ${!isAnnual ? "text-ink" : "text-ink-muted"}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-5 w-9 items-center rounded-full bg-border-strong transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              role="switch"
              aria-checked={isAnnual}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  isAnnual ? "translate-x-4 bg-accent" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className={`font-medium ${isAnnual ? "text-ink" : "text-ink-muted"}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="text-[11px] font-medium text-accent bg-accent-subtle border border-accent/20 px-2 py-0.5 rounded">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const displayPrice = isAnnual ? Math.round(plan.price * 0.8) : plan.price;
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={plan._id}
                className={`rounded-lg bg-surface p-6 flex flex-col justify-between ${
                  isHighlighted
                    ? "border-2 border-accent"
                    : "border border-border"
                }`}
              >
                <div>
                  {/* Top Header & Plain-text label */}
                  <div className="flex items-center justify-between h-6">
                    <h3 className="text-base font-bold text-ink">{plan.name}</h3>
                    {isHighlighted && (
                      <span className="text-xs font-semibold text-accent">
                        Most popular
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                      ${displayPrice}
                    </span>
                    <span className="text-xs text-ink-muted">
                      / month {isAnnual ? "billed annually" : "billed monthly"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-ink-muted">
                    {plan.name === "Starter" && "Essential capacity tracking for early-stage engineering squads."}
                    {plan.name === "Team" && "Full workload heatmaps and burnout risk alerts for growing agencies."}
                    {plan.name === "Business" && "Custom capacity planning and enterprise reporting for large orgs."}
                  </p>

                  <div className="my-5 border-t border-border" />

                  {/* Features List */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-medium text-ink">Included in {plan.name}:</div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-xs text-ink-muted">
                          <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Plain Button */}
                <div className="mt-8 pt-2">
                  <a
                    href="#pricing"
                    className={`flex w-full items-center justify-center rounded-md px-4 py-2 text-xs font-medium transition-colors ${
                      isHighlighted
                        ? "bg-accent text-white hover:bg-accent-hover"
                        : "border border-border bg-surface text-ink hover:bg-background hover:border-border-strong"
                    }`}
                  >
                    Start free trial
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
