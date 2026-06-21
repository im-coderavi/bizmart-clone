import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    text: String,
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    category: { type: String, default: "General" },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    views: { type: Number, default: 0 },
    comments: [commentSchema],
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

blogSchema.index({ title: "text", content: "text" });

export default mongoose.model("Blog", blogSchema);
