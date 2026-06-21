import Setting from "../models/Setting.js";
import { asyncHandler } from "../utils/helpers.js";

// GET /api/settings/payment  (public — what the checkout page needs)
export const getPublicPaymentSettings = asyncHandler(async (req, res) => {
  const s = await Setting.get();
  res.json({
    payment: {
      upiId: s.payment.upiId,
      payeeName: s.payment.payeeName,
      qrImage: s.payment.qrImage,
      instructions: s.payment.instructions,
      enabled: s.payment.enabled,
    },
  });
});

// GET /api/admin/settings
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.get();
  res.json({ settings });
});

// PUT /api/admin/settings
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.get();
  const { payment, siteName, supportEmail } = req.body;
  if (payment) settings.payment = { ...settings.payment.toObject(), ...payment };
  if (siteName !== undefined) settings.siteName = siteName;
  if (supportEmail !== undefined) settings.supportEmail = supportEmail;
  await settings.save();
  res.json({ settings });
});
