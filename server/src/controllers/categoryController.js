import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { asyncHandler, uniqueSlug } from "../utils/helpers.js";

// GET /api/categories  (public, with product counts)
export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
  const counts = await Product.aggregate([
    { $match: { status: "published" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  res.json({
    items: categories.map((c) => ({ ...c, productCount: countMap[String(c._id)] || 0 })),
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  body.slug = await uniqueSlug(Category, body.slug || body.name);
  const category = await Category.create(body);
  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  const body = { ...req.body };
  if (body.slug && body.slug !== category.slug)
    body.slug = await uniqueSlug(Category, body.slug, category._id);
  Object.assign(category, body);
  await category.save();
  res.json({ category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Product.countDocuments({ category: req.params.id });
  if (inUse > 0)
    return res
      .status(400)
      .json({ message: `Cannot delete: ${inUse} product(s) use this category` });
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json({ message: "Category deleted" });
});
