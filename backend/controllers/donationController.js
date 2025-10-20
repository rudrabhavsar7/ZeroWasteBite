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
import { Volunteer } from "../models/Volunteer.js";
import { sendMail } from "../utils/NodeMailer.js";

const addDonation = asyncHandler(async (req, res) => {
  const user = req.user;
  const {
    title,
    food_type,
    storage,
    time_since_prep,
    is_sealed,
    environment,
    confidence,
    description,
    coordinates
  } = req.body;

  if (
    [title, food_type, storage, environment].some(
      (field) => field?.trim() === ""
    )
  ) {
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

  // const location = user.location.coordinates;

  // console.log(location); 

  const donation = await Donation.create({
    donor: user._id,
    title,
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
    location: {
      coordinates,
    },
  });


  if (donation.expiryPrediction && donation.expiryPrediction.riskLevel === "high") {
    console.log("Processing high-risk donation:", donation._id);
    // Your high-risk operations
    const volunteers = await Volunteer.aggregate([
      // 1. Use $geoNear first
      {
        $geoNear: {
          near: { type: "Point", coordinates: donation.location.coordinates },
          distanceField: "distance",
          spherical: true,
          maxDistance: 100 * 1000, // meters
        },
      },
      // 2. Lookup email from User
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      // 3. Unwind userInfo
      { $unwind: "$userInfo" },
      // 4. Only those within their own serviceRadius
      {
        $match: {
          $expr: {
            $lte: ["$distance", { $multiply: ["$serviceRadius", 1000] }],
          },
        },
      },
      // 5. Project desired fields
      {
        $project: {
          _id: 1,
          email: "$userInfo.email",
          distance: 1,
          serviceRadius: 1,
          name: "$userInfo.name"
        },
      },
    ]);

    volunteers.forEach((volunteer)=>{
      sendMail(volunteer.email,"Urgent Pickup Required","Pick Up The Donation, Urgent Pickup Required");
    })
  }

  res
    .status(200)
    .json(new ApiResponse(200, donation, "Donation Added Successfully"));
});

const viewUserDonations = asyncHandler(async (req, res) => {
  const user = req.user;
  const donations = await Donation.find({ donor: user._id });
  if (!donations)
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No Donations Available"));
  return res
    .status(200)
    .json(
      new ApiResponse(200, donations, "User Donations Fetched Successfully")
    );
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

  const volunteer = await Volunteer.findOne({ userId: user._id });

  if (!volunteer) throw new ApiError(404, "Volunteer Not Found");

  if(!volunteer.isVerified){
    throw new ApiError(404, "Volunteer Not Verified");
  }

  const { coordinates } = volunteer.location;
  const { serviceRadius } = volunteer;

  const donations = await Donation.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: coordinates,
        },
        $maxDistance: serviceRadius * 1000, // meters
      },
    },
    status: "available", // or any other filter
  });

  return res.status(200).json(new ApiResponse(200, donations, "Successful"));
});

const claimDonation = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role === "donor") throw new ApiError(401, "Unauthorized Access");

  const { donationId } = req.body;

  if (!donationId) throw new ApiError(401, "Error fetching Donation Id");

  const donation = await Donation.findOne({ _id: donationId, claimedBy: null });

  if (!donation)
    throw new ApiError(404, "Donation Not Found or Already Claimed");
  donation.status = "claimed";
  donation.claimedBy = user._id;

  await donation.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, donation, "Donation Claimed Successfully"));
});

const updateDonationDetails = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role === "donor") throw new ApiError(401, "Unauthorized Access");

  const { donationId, status } = req.body;

  if (!donationId) throw new ApiError(401, "Error fetching Donation Id");
  if (status.trim() === "") throw new ApiError(401, "Choose Valid Status");

  const donation = await Donation.findOne({
    _id: donationId,
    claimedBy: user._id,
  });

  if (!donation) throw new ApiError(404, "Donation Not Found");

  donation.status = status;

  await donation.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, donation, "Donation Status Updated Successfully")
    );
});

const viewVolunteerAssignedDonations = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.role === "donor") throw new ApiError(401, "Unauthorized Access");

  const donations = await Donation.find({ claimedBy: user._id });

  if (!donations)
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No Donations Available"));
  return res
    .status(200)
    .json(
      new ApiResponse(200, donations, "Volunteer Assigned Donations Fetched Successfully")
    );
});

export {
  addDonation,
  viewDonations,
  viewUserDonations,
  viewAvailableDonations,
  claimDonation,
  updateDonationDetails,
  viewVolunteerAssignedDonations,
};
