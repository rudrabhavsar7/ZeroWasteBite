import { Donation } from "../models/Donation.js";

export function startDonationExpiryScheduler({ intervalMs = 60 * 1000 } = {}) {
  async function tick() {
    try {
      const now = new Date();
      const result = await Donation.updateMany(
        { expiresAt: { $lte: now }, status: { $in: ["available", "claimed"] } },
        { $set: { status: "expired" } }
      );
      if (result?.modifiedCount) {
        console.log(`Donation expiry: marked ${result.modifiedCount} expired`);
      }
    } catch (err) {
      console.error("Donation expiry job failed:", err);
    }
  }

  tick();
  const handle = setInterval(tick, intervalMs);
  return () => clearInterval(handle);
}
