import mongoose from "mongoose";

// Singleton settings document (key: "global")
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },

    // Manual UPI / QR payment configuration
    payment: {
      upiId: { type: String, default: "" }, // e.g. yourname@okhdfcbank
      payeeName: { type: String, default: "" }, // name shown in UPI app
      qrImage: { type: String, default: "" }, // Cloudinary URL of QR code
      instructions: {
        type: String,
        default:
          "Scan the QR or pay to the UPI ID above. After paying, enter your UTR/Transaction ID and upload the payment screenshot. Your membership will be activated once the admin verifies the payment.",
      },
      enabled: { type: Boolean, default: true },
    },

    siteName: { type: String, default: "Digital Marketplace" },
    supportEmail: { type: String, default: "admin@blizmatt.com" },
  },
  { timestamps: true }
);

// Helper to always get (or create) the single settings doc
settingSchema.statics.get = async function () {
  let doc = await this.findOne({ key: "global" });
  if (!doc) doc = await this.create({ key: "global" });
  return doc;
};

export default mongoose.model("Setting", settingSchema);
