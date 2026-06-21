import jwt from "jsonwebtoken";

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ensures a unique slug for a given Mongoose model
export async function uniqueSlug(Model, base, ignoreId = null) {
  let slug = slugify(base) || "item";
  let candidate = slug;
  let i = 1;
  while (true) {
    const query = { slug: candidate };
    if (ignoreId) query._id = { $ne: ignoreId };
    const exists = await Model.findOne(query).lean();
    if (!exists) return candidate;
    candidate = `${slug}-${i++}`;
  }
}
