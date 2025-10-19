import mongoose from "mongoose";
import { Volunteer } from "./Volunteer.js";
import { sendMail } from "../utils/NodeMailer.js";

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: "String",
      required: true,
    },
    food_type: {
      type: String,
      enum: ["cooked_veg", "non_veg", "packaged", "raw"],
      required: true,
    },
    storage: {
      type: String,
      enum: ["fridge", "room_temp"],
      required: true,
    },
    time_since_prep: {
      type: Number, // in hours
      required: true,
    },
    is_sealed: {
      type: Boolean,
      required: true,
    },
    environment: {
      type: String,
      enum: ["dry", "humid"],
      required: true,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    // ML Prediction Output
    expiryPrediction: {
      safeForHours: { type: Number }, // e.g., 6 hours
      confidence: { type: Number }, // 0 to 1 or 0 to 100%
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
    },

    // Auto-computed: when this donation becomes unsafe
    expiresAt: { type: Date },

    description: {
      type: String,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      default: null,
    },
    status: {
      type: String,
      enum: ["available", "claimed", "expired", "picked"],
      default: "available",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

donationSchema.index({ location: "2dsphere" });
donationSchema.index({ expiresAt: 1, status: 1 });

// Virtual: hours remaining until expiration (rounded to 0.1h)
donationSchema.virtual("remainingHours").get(function () {
  if (!this.expiresAt) return null;
  const diffMs = this.expiresAt.getTime() - Date.now();
  return Math.max(0, Math.round((diffMs / 36e5) * 10) / 10);
});

function computeExpiresAt(doc) {
  const safe = doc?.expiryPrediction?.safeForHours;
  if (typeof safe === "number" && !Number.isNaN(safe)) {
    const base = doc.createdAt instanceof Date ? doc.createdAt : new Date();
    return new Date(base.getTime() + safe * 60 * 60 * 1000);
  }
  return undefined;
}

// On create (and save), set expiresAt if not already set
donationSchema.pre("save", function (next) {
  if (!this.expiresAt) {
    const exp = computeExpiresAt(this);
    if (exp) this.expiresAt = exp;
  }
  next();
});

// If safeForHours is updated via findOneAndUpdate, recompute expiresAt
donationSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {};
  const direct = update?.expiryPrediction?.safeForHours;
  const setPath = update?.$set?.["expiryPrediction.safeForHours"];
  const newSafe = typeof direct === "number" ? direct : typeof setPath === "number" ? setPath : undefined;
  if (typeof newSafe === "number") {
    this.set("_newSafeForHours", newSafe);
  }
  next();
});

donationSchema.post("findOneAndUpdate", async function (res) {
  try {
    const newSafe = this.get("_newSafeForHours");
    if (typeof newSafe === "number" && res) {
      const createdAt = res.createdAt instanceof Date ? res.createdAt : new Date();
      const expiresAt = new Date(createdAt.getTime() + newSafe * 60 * 60 * 1000);
      if (!res.expiresAt || res.expiresAt.getTime() !== expiresAt.getTime()) {
        await this.model.updateOne({ _id: res._id }, { $set: { expiresAt } });
      }
    }
  } catch (err) {
    console.error("Donation expiresAt recompute error:", err);
  }
});

// donationSchema.post("save", async function () {
//   const { riskLevel } = this.expiryPrediction;
//   const Volunteers = await Volunteer.find();

//   console.log(Volunteers);

//   if (riskLevel === "high") {
//     console.log("HIgh");
//   }
// });

// donationSchema.post("save", async function (res) {
//   const volunteerId = res.claimedBy;
//   const donationId = res._id;

//   const volunteer = await Volunteer.findOneAndUpdate(
//     { userId: volunteerId },
//     {
//       $push: { assignedDonations: donationId },
//     },
//     { new: true }
//   );
// });

donationSchema.post("save", async function (doc) {
  if (doc.claimedBy && doc.status === "claimed") {
    console.log("Processing claimed donation:", doc._id);

    const volunteer = await Volunteer.findOneAndUpdate(
      { userId: doc.claimedBy },
      { $push: { assignedDonations: doc._id } },
      { new: true }
    );
    console.log("Volunteer updated:", volunteer);
  }
});

export const Donation = mongoose.model("Donation", donationSchema);
