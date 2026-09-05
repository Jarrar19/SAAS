"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AuthGuard } from "../../../components/admin/AuthGuard";
import { AdminNav } from "../../../components/admin/AdminNav";
import { PlanForm } from "../../../components/admin/PlanForm";
import {
  PricingPlan,
  fetchAdminPlans,
  deleteAdminPlan,
  updateAdminPlan,
} from "../../../lib/api";
import { getStoredToken } from "../../../lib/auth";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  // Delete confirmation modal state
  const [planToDelete, setPlanToDelete] = useState<PricingPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load plans from API
  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const token = getStoredToken();
    if (!token) {
      setErrorMessage("Authentication token missing. Please sign in.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetchAdminPlans(token);
      if (res.success && res.data) {
        setPlans(res.data);
      } else {
        setErrorMessage(res.error?.message || "Failed to load pricing plans.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to connect to backend server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setSelectedPlan(null);
    setIsFormOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  // Quick toggle published status
  const handleTogglePublish = async (plan: PricingPlan) => {
    const token = getStoredToken();
    if (!token) return;

    try {
      const res = await updateAdminPlan(
        plan._id,
        { published: !plan.published },
        token
      );
      if (res.success && res.data) {
        setPlans((prev) =>
          prev.map((p) => (p._id === plan._id ? res.data! : p))
        );
      } else {
        alert(res.error?.message || "Failed to toggle status.");
      }
    } catch (err: any) {
      alert(err.message || "Network error while updating status.");
    }
  };

  // Confirm and delete
  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    const token = getStoredToken();
    if (!token) return;

    setIsDeleting(true);
    try {
      const res = await deleteAdminPlan(planToDelete._id, token);
      if (res.success) {
        setPlans((prev) => prev.filter((p) => p._id !== planToDelete._id));
        setPlanToDelete(null);
      } else {
        alert(res.error?.message || "Failed to delete pricing plan.");
      }
    } catch (err: any) {
      alert(err.message || "Network error while deleting plan.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Callback when plan is saved in modal
  const handlePlanSaved = (savedPlan: PricingPlan) => {
    loadPlans();
  };

  const publishedCount = plans.filter((p) => p.published).length;
  const draftCount = plans.filter((p) => !p.published).length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AdminNav />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-border">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                  Pricing Plans
                </h1>
                <span className="rounded-full bg-border px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
                  {plans.length} total
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                Manage public tiers, feature lists, and live vs. draft visibility.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadPlans}
                disabled={isLoading}
                title="Refresh list"
                className="rounded-md border border-border p-2 text-ink-muted hover:text-ink hover:bg-surface transition-colors"
              >
                <svg
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors shadow-xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Plan</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Published on Site
              </div>
              <div className="text-2xl font-bold text-ink mt-1 flex items-center gap-2">
                <span>{publishedCount}</span>
                <span className="h-2 w-2 rounded-full bg-accent" />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Drafts (Hidden)
              </div>
              <div className="text-2xl font-bold text-ink-muted mt-1 flex items-center gap-2">
                <span>{draftCount}</span>
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4 col-span-2 sm:col-span-1">
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Highlighted Tier
              </div>
              <div className="text-sm font-medium text-ink mt-2 truncate">
                {plans.find((p) => p.highlighted)?.name || "None active"}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Plans Table / Cards */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg border border-border bg-surface animate-pulse"
                />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
              <h3 className="text-base font-semibold text-ink">No pricing plans yet</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Create your first plan to start displaying pricing tiers on the landing page.
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
              >
                Create Plan
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-background/60 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    <tr>
                      <th className="px-6 py-3.5">Order</th>
                      <th className="px-6 py-3.5">Plan Name</th>
                      <th className="px-6 py-3.5">Price & Cycle</th>
                      <th className="px-6 py-3.5">Features</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {plans.map((plan) => (
                      <tr key={plan._id} className="hover:bg-background/40 transition-colors">
                        {/* Order */}
                        <td className="px-6 py-4 font-mono text-xs text-ink-muted">
                          #{plan.order ?? 0}
                        </td>

                        {/* Name & Highlighted */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-ink flex items-center gap-2">
                            <span>{plan.name}</span>
                            {plan.highlighted && (
                              <span className="rounded bg-accent-subtle px-1.5 py-0.5 text-[10px] font-semibold text-accent uppercase tracking-wider border border-accent/20">
                                Highlighted
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          <div className="font-mono text-ink font-semibold">
                            ${plan.price}
                            <span className="text-xs text-ink-muted font-normal">
                              {" "}
                              / {plan.billingCycle}
                            </span>
                          </div>
                        </td>

                        {/* Features count */}
                        <td className="px-6 py-4">
                          <div className="text-xs text-ink-muted">
                            <span className="font-medium text-ink">
                              {plan.features?.length || 0} features
                            </span>
                            <div className="truncate max-w-xs text-[11px] text-ink-muted mt-0.5">
                              {plan.features?.slice(0, 2).join(", ")}
                              {plan.features?.length > 2 ? "..." : ""}
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(plan)}
                            title="Click to toggle status"
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                          >
                            {plan.published ? (
                              <span className="inline-flex items-center gap-1.5 text-accent bg-accent-subtle px-2 py-0.5 rounded-full border border-accent/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Draft
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(plan)}
                              className="rounded border border-border px-2.5 py-1 text-xs font-medium text-ink hover:bg-background transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setPlanToDelete(plan)}
                              className="rounded border border-border px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Create / Edit Plan Modal */}
        <PlanForm
          isOpen={isFormOpen}
          initialData={selectedPlan}
          onClose={() => setIsFormOpen(false)}
          onSaved={handlePlanSaved}
        />

        {/* Delete Confirmation Modal */}
        {planToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-surface border border-border p-6 shadow-xl">
              <h3 className="text-base font-semibold text-ink">Delete Pricing Plan</h3>
              <p className="mt-2 text-sm text-ink-muted">
                Are you sure you want to delete <strong className="text-ink">{planToDelete.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPlanToDelete(null)}
                  disabled={isDeleting}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Delete Plan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
