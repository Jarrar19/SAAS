"use client";

import React from "react";

interface FeatureListEditorProps {
  features: string[];
  onChange: (newFeatures: string[]) => void;
  disabled?: boolean;
}

export function FeatureListEditor({
  features,
  onChange,
  disabled = false,
}: FeatureListEditorProps) {
  const handleFeatureTextChange = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...features];
    const [moved] = updated.splice(index, 1);
    updated.splice(index - 1, 0, moved);
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === features.length - 1) return;
    const updated = [...features];
    const [moved] = updated.splice(index, 1);
    updated.splice(index + 1, 0, moved);
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    if (features.length <= 1) return; // Must have at least 1 feature per Zod schema
    const updated = features.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...features, ""]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
          Features List <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-ink-muted">
          {features.length} {features.length === 1 ? "item" : "items"} (reorderable)
        </span>
      </div>

      <div className="space-y-2">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-surface p-2 rounded-md border border-border transition-colors hover:border-border-strong"
          >
            {/* Reorder Up/Down controls */}
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handleMoveUp(index)}
                disabled={disabled || index === 0}
                title="Move up"
                className="p-1 rounded text-ink-muted hover:text-ink hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(index)}
                disabled={disabled || index === features.length - 1}
                title="Move down"
                className="p-1 rounded text-ink-muted hover:text-ink hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Feature Text Input */}
            <div className="flex-1">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureTextChange(index, e.target.value)}
                disabled={disabled}
                placeholder="e.g. Automated workload heatmaps"
                required
                className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={disabled || features.length <= 1}
              title={features.length <= 1 ? "At least one feature is required" : "Remove feature"}
              className="p-1.5 rounded text-ink-muted hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors py-1 px-2 rounded hover:bg-accent-subtle"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add feature line</span>
        </button>

        {features.length <= 1 && (
          <span className="text-[11px] text-ink-muted">
            Minimum 1 feature required by schema.
          </span>
        )}
      </div>
    </div>
  );
}
