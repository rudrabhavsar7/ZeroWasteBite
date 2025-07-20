import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    availability: {
      type: String,
      enum: ["full-time", "part-time"],
      default: "part-time",
    },
    vehicleType: {
      type: String,
      enum: ["bike", "car", "none"],
      default: "bike",
    },
    serviceRadius: Number,
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    assignedDonations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Donation" },
    ],
    isVerified:{
        type:Boolean,
        default:false
    }
  },
  {
    timestamps: true,
  }
);
volunteerSchema.index({ location: "2dsphere" });

export const Volunteer = mongoose.model("Volunteer", volunteerSchema);
