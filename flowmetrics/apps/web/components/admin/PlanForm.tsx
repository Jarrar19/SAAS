"use client";

import React, { useEffect, useState } from "react";
import {
  PricingPlan,
  PricingPlanInput,
  createAdminPlan,
  updateAdminPlan,
  ApiError,
} from "../../lib/api";
import { getStoredToken } from "../../lib/auth";
import { FeatureListEditor } from "./FeatureListEditor";

interface PlanFormProps {
  initialData?: PricingPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (plan: PricingPlan) => void;
}

export function PlanForm({
  initialData,
  isOpen,
  onClose,
  onSaved,
}: PlanFormProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [order, setOrder] = useState<number>(0);
  const [highlighted, setHighlighted] = useState(false);
  const [published, setPublished] = useState(false);
  const [features, setFeatures] = useState<string[]>([""]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Sync form state when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.price);
      setBillingCycle(initialData.billingCycle);
      setOrder(initialData.order ?? 0);
      setHighlighted(initialData.highlighted ?? false);
      setPublished(initialData.published ?? false);
      setFeatures(
        Array.isArray(initialData.features) && initialData.features.length > 0
          ? [...initialData.features]
          : [""]
      );
    } else {
      // Defaults for Create mode
      setName("");
      setPrice(29);
      setBillingCycle("monthly");
      setOrder(1);
      setHighlighted(false);
      setPublished(false);
      setFeatures(["Up to 10 engineers", "Basic sprint allocation analytics"]);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = getStoredToken();
    if (!token) {
      setError({
        code: "UNAUTHORIZED",
        message: "Your session has expired. Please sign in again.",
      });
      return;
    }

    // Client validation for clean UX
    const cleanedFeatures = features.map((f) => f.trim()).filter(Boolean);
    if (cleanedFeatures.length === 0) {
      setError({
        code: "VALIDATION_ERROR",
        message: "Features list must contain at least one non-empty feature item.",
        details: [{ field: "features", issue: "At least one feature is required" }],
      });
      return;
    }

    const payload: PricingPlanInput = {
      name: name.trim(),
      price: Number(price),
      billingCycle,
      order: Number(order),
      highlighted,
      published,
      features: cleanedFeatures,
    };

    setIsLoading(true);

    try {
      let res;
      if (isEdit && initialData?._id) {
        res = await updateAdminPlan(initialData._id, payload, token);
      } else {
        res = await createAdminPlan(payload, token);
      }

      if (res.success && res.data) {
        onSaved(res.data);
        onClose();
      } else {
        setError(
          res.error || {
            code: "SAVE_ERROR",
            message: "Failed to save plan. Please check all fields.",
          }
        );
      }
    } catch (err: any) {
      setError({
        code: "UNEXPECTED_ERROR",
        message: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 sm:p-6 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-xl bg-surface border border-border shadow-xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/50">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {isEdit ? `Edit Plan: ${initialData?.name}` : "Create New Pricing Plan"}
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Configure plan pricing, visibility, and nested feature highlights.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded p-1 text-ink-muted hover:text-ink hover:bg-background transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Error Banner */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error.message}</span>
              </div>
              {error.details && error.details.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-xs space-y-1">
                  {error.details.map((d, i) => (
                    <li key={i}>
                      {d.field ? <strong className="capitalize">{d.field}:</strong> : null} {d.issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Row 1: Plan Name & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Team Workload Pro"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-ink-muted">$</span>
                <input
                  type="number"
                  required
                  min={0}
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-border bg-background pl-7 pr-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Billing Cycle & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Billing Cycle <span className="text-red-500">*</span>
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as "monthly" | "annual")}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                placeholder="1, 2, 3..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <span className="text-[11px] text-ink-muted mt-1 block">
                Lowest order number displays first on public site.
              </span>
            </div>
          </div>

          {/* Row 3: Flags / Toggles */}
          <div className="p-4 rounded-lg border border-border bg-background/50 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={highlighted}
                onChange={(e) => setHighlighted(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent"
              />
              <div>
                <div className="text-sm font-medium text-ink">Highlighted (Most Popular badge)</div>
                <div className="text-xs text-ink-muted">
                  Visually distinguishes this tier with an accent border and badge on the pricing section.
                </div>
              </div>
            </label>

            <div className="h-px bg-border" />

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent"
              />
              <div>
                <div className="text-sm font-medium text-ink">Published (Live on site)</div>
                <div className="text-xs text-ink-muted">
                  When unchecked, the plan remains a draft and is completely hidden from public visitors.
                </div>
              </div>
            </label>
          </div>

          {/* Row 4: Nested Feature List Editor */}
          <div className="pt-2">
            <FeatureListEditor
              features={features}
              onChange={setFeatures}
              disabled={isLoading}
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink hover:bg-background transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? "Update Plan" : "Create Plan"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
