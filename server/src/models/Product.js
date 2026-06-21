import mongoose from "mongoose";

const changelogSchema = new mongoose.Schema(
  {
    version: String,
    date: { type: Date, default: Date.now },
    notes: String,
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    type: {
      type: String,
      enum: ["Theme", "Plugin", "Template", "Course", "Graphic", "Other"],
      default: "Plugin",
    },

    thumbnail: { type: String, default: "" },
    screenshots: [{ type: String }],

    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    features: [{ type: String }],

    version: { type: String, default: "1.0.0" },
    changelog: [changelogSchema],
    fileSize: { type: String, default: "" }, // e.g. "12 MB"
    downloadUrl: { type: String, default: "" }, // protected resource
    demoUrl: { type: String, default: "" },

    price: { type: Number, default: 0 }, // 0 = included in membership
    membershipRequired: { type: Boolean, default: true },

    downloadsCount: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "published" },

    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", shortDescription: "text", description: "text" });

export default mongoose.model("Product", productSchema);
