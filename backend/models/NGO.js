import mongoose from "mongoose";
import { Counter } from "./Counter.js";

const ngoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  organizationName: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: Number
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  donationsReceived: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Donation" }
  ],
  deliveryPartners: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" }
  ]
}, { timestamps: true });

// Auto-generate incremental registrationNumber like NGO-000001
ngoSchema.pre("validate", async function (next) {
  try {
    if (!this.isNew) return next();
    if (this.registrationNumber) return next();

    const counter = await Counter.findOneAndUpdate(
      { key: "NGO_REGISTRATION" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const seq = counter.seq || 1;
    // Zero-pad to 6 digits; adjust to your preference
    this.registrationNumber = `NGO-${String(seq).padStart(6, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

export const NGO = mongoose.model("NGO", ngoSchema);
