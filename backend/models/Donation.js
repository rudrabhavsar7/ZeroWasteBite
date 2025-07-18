import mongoose from "mongoose"

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    // ML Prediction Output
    is_safe: {
      type: Boolean,
      default: null, // filled after prediction
    },

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
  { timestamps: true }
);

