import { z } from "zod";

/**
 * Zod validation schema for PricingPlan creation.
 * Strict rules aligned with Mongoose schema & business rules:
 * - name: non-empty trimmed string
 * - price: number >= 0
 * - billingCycle: strictly 'monthly' | 'annual'
 * - features: array of min 1 item; each item must be a non-empty trimmed string (rejects empty/whitespace strings)
 * - highlighted: boolean (default false)
 * - published: boolean (default false)
 * - order: integer >= 0 (default 0)
 */
export const createPricingPlanSchema = z.object({
  name: z.string({ required_error: "Plan name is required" })
    .trim()
    .min(1, "Plan name cannot be empty"),
  price: z.number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
    .nonnegative("Price must be a non-negative number (>= 0)"),
  billingCycle: z.enum(["monthly", "annual"], {
    errorMap: () => ({ message: "Billing cycle must be either 'monthly' or 'annual'" }),
  }),
  features: z.array(
    z.string({ invalid_type_error: "Each feature must be a string" })
      .trim()
      .min(1, "Feature item cannot be empty or whitespace"),
    { required_error: "Features list is required", invalid_type_error: "Features must be an array of strings" }
  ).min(1, "Features list must contain at least 1 feature item"),
  highlighted: z.boolean({ invalid_type_error: "Highlighted must be a boolean" })
    .optional()
    .default(false),
  published: z.boolean({ invalid_type_error: "Published must be a boolean" })
    .optional()
    .default(false),
  order: z.number({ invalid_type_error: "Order must be a number" })
    .int("Order must be an integer")
    .optional()
    .default(0),
});

export const updatePricingPlanSchema = createPricingPlanSchema.partial();

export type CreatePricingPlanInput = z.infer<typeof createPricingPlanSchema>;
export type UpdatePricingPlanInput = z.infer<typeof updatePricingPlanSchema>;
