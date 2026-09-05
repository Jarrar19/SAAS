import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPricingPlan extends Document {
  name: string;
  price: number;
  billingCycle: "monthly" | "annual";
  features: string[];
  highlighted: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PricingPlanSchema = new Schema<IPricingPlan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "annual"],
      required: true,
    },
    features: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length >= 1,
        message: "A pricing plan must have at least one feature",
      },
    },
    highlighted: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: false,
      index: true, // Optimizes public queries filtering by published: true
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const PricingPlan: Model<IPricingPlan> =
  mongoose.models.PricingPlan || mongoose.model<IPricingPlan>("PricingPlan", PricingPlanSchema);
