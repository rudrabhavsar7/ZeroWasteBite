import mongoose from "mongoose";
import { Volunteer } from "./Volunteer.js";

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
    expiryPrediction: {
      safeForHours: { type: Number }, // e.g., 6 hours
      confidence: { type: Number }, // 0 to 1 or 0 to 100%
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
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

  if (this.isNew) {
    if (doc.expiryPrediction && doc.expiryPrediction.riskLevel === "high") {
      console.log("Processing high-risk donation:", doc._id);
      // Your high-risk operations
    }
  } else {
    // This runs for updated donations (claiming logic)
    if (doc.claimedBy && doc.status === "claimed") {
      console.log("Processing claimed donation:", doc._id);
      
      const volunteer = await Volunteer.findOneAndUpdate(
        { userId: doc.claimedBy },
        { $push: { assignedDonations: doc._id } },
        { new: true }
      );
      console.log("Volunteer updated:", volunteer);
    }
  }
});


export const Donation = mongoose.model("Donation", donationSchema);
