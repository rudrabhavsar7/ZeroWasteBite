import mongoose from "mongoose";

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

export const NGO = mongoose.model("NGO", ngoSchema);
