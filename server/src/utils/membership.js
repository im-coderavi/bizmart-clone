import Subscription from "../models/Subscription.js";
import { sendEmail, templates } from "./email.js";

/**
 * Activates (or extends) a user's membership for a given plan and links it to a
 * payment. Sends activation + payment confirmation emails. Shared by the admin
 * approval flow and any automated gateway flow.
 */
export async function activateMembership(user, plan, payment) {
  let expiresAt = null;
  if (plan.durationDays && plan.durationDays > 0) {
    const base =
      user.membership?.isActive && user.membership.expiresAt > new Date()
        ? new Date(user.membership.expiresAt)
        : new Date();
    expiresAt = new Date(base.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
  }

  const subscription = await Subscription.create({
    user: user._id,
    plan: plan._id,
    payment: payment?._id,
    expiresAt,
    amount: payment?.amount ?? 0,
    status: "active",
  });

  user.membership = { isActive: true, plan: plan._id, expiresAt };
  await user.save();

  sendEmail({
    to: user.email,
    ...templates.membershipActivated(user.name, plan.name, expiresAt),
  }).catch(() => {});
  if (payment) {
    sendEmail({
      to: user.email,
      ...templates.paymentApproved(user.name, payment.amount, plan.name),
    }).catch(() => {});
  }

  return { subscription, expiresAt };
}
