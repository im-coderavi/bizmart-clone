import Plan from "../models/Plan.js";
import { asyncHandler, uniqueSlug } from "../utils/helpers.js";

// GET /api/plans  (public — active plans)
export const listPlans = asyncHandler(async (req, res) => {
  const items = await Plan.find({ isActive: true }).sort({ order: 1, price: 1 }).lean();
  res.json({ items });
});

// GET /api/admin/plans
export const adminListPlans = asyncHandler(async (req, res) => {
  const items = await Plan.find().sort({ order: 1, price: 1 }).lean();
  res.json({ items });
});

export const createPlan = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  body.slug = await uniqueSlug(Plan, body.slug || body.name);
  const plan = await Plan.create(body);
  res.status(201).json({ plan });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) return res.status(404).json({ message: "Plan not found" });
  const body = { ...req.body };
  if (body.slug && body.slug !== plan.slug)
    body.slug = await uniqueSlug(Plan, body.slug, plan._id);
  Object.assign(plan, body);
  await plan.save();
  res.json({ plan });
});

export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByIdAndDelete(req.params.id);
  if (!plan) return res.status(404).json({ message: "Plan not found" });
  res.json({ message: "Plan deleted" });
});
