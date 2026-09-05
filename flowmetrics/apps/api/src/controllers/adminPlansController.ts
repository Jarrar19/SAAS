import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { PricingPlan } from "../models/PricingPlan.js";
import { CreatePricingPlanInput, UpdatePricingPlanInput } from "../schemas/pricingPlan.schema.js";

/**
 * GET /api/admin/plans
 * Returns all pricing plans (published and draft), sorted by order.
 */
export async function getAdminPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plans = await PricingPlan.find().sort({ order: 1 }).lean();
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/plans/:id
 * Returns a single pricing plan by ID.
 * Invalid ObjectId triggers Mongoose CastError -> caught by globalErrorHandler -> 400
 */
export async function getAdminPlanById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const plan = await PricingPlan.findById(id).lean();

    if (!plan) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Pricing plan with ID '${id}' not found.`,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/plans
 * Creates a new pricing plan from validated request body.
 */
export async function createAdminPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const planData = req.body as CreatePricingPlanInput;
    const newPlan = await PricingPlan.create(planData);

    res.status(201).json({
      success: true,
      data: newPlan,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/plans/:id
 * Updates an existing pricing plan by ID.
 */
export async function updateAdminPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdatePricingPlanInput;
    const updatedPlan = await PricingPlan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedPlan) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Pricing plan with ID '${id}' not found.`,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/plans/:id
 * Deletes a pricing plan by ID.
 */
export async function deleteAdminPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const deletedPlan = await PricingPlan.findByIdAndDelete(id).lean();

    if (!deletedPlan) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Pricing plan with ID '${id}' not found.`,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: `Pricing plan '${deletedPlan.name}' successfully deleted.`,
        id: deletedPlan._id,
      },
    });
  } catch (error) {
    next(error);
  }
}
