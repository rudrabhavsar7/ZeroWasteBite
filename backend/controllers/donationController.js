import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Donation } from "../models/Donation.js";
import {
  loadRiskModel,
  loadSafeHoursModel,
  predictRiskLevel,
  predictSafeHours,
} from "../mlModel/riskModel.js";

const addDonation = asyncHandler(async (req, res) => {
  const user = req.user;
  const {
    food_type,
    storage,
    time_since_prep,
    is_sealed,
    environment,
    confidence,
    description,
  } = req.body;

  if ([food_type, storage, environment].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields are required");
  }

  if (!time_since_prep || !confidence)
    throw new ApiError(400, "All Fields are required");

  const fields = {
    food_type,
    storage,
    time_since_prep,
    is_sealed,
    environment,
    confidence,
  };

  await loadRiskModel();
  const riskLevel = await predictRiskLevel(fields);
  await loadSafeHoursModel();
  const safeForHours = await predictSafeHours(fields);

  if (!riskLevel) throw new ApiError(500, "Risk Prediction Error");
  if (!safeForHours) throw new ApiError(500, "Safe For Hours Prediction Error");

  const donation = await Donation.create({
    donor: user._id,
    food_type,
    storage,
    time_since_prep,
    is_sealed,
    environment,
    expiryPrediction: {
      safeForHours,
      confidence,
      riskLevel,
    },
    description,
  });

  res
    .status(200)
    .json(new ApiResponse(200, donation, "Donation Added Successfully"));
});

const viewDonations = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role === "donor") throw new ApiError(401, "Unauthorized Access");

  const donations = await Donation.find();

  if (!donations)
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No Donations Available"));

  return res
    .status(200)
    .json(new ApiResponse(200, donations, "Donations Fetched Successfully"));
});

const viewAvailableDonations = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role === "donor") throw new ApiError(401, "Unauthorized Access");

  const donation = await Donation.find({
    status: "available",
    claimedBy: null,
  });

  return res.status(200).json(new ApiResponse(200, donation, "Successful"));
});

const claimDonation = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role === "donor") throw new ApiError(401, "Unauthorized Access");

  const { donationId } = req.body;

  if (!donationId) throw new ApiError(401, "Error fetching Donation Id");

  const donation = await Donation.findOne({_id:donationId,claimedBy:null})
  
  if (!donation) throw new ApiError(404, "Donation Not Found or Already Claimed");
  donation.status = "claimed";
  donation.claimedBy = user._id;

  await donation.save({validateBeforeSave:false});

  return res
    .status(200)
    .json(new ApiResponse(200, donation, "Donation Claimed Successfully"));
});

export { addDonation, viewDonations, viewAvailableDonations, claimDonation };
