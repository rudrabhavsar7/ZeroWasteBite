import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { NGO } from "../models/NGO.js";
import { User } from "../models/User.js";
import { Volunteer } from "../models/Volunteer.js";
import { Donation } from "../models/Donation.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerNGO = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    coordinates,
    organizationName,
    street,
    city,
    state,
    zip,
  } = req.body;

  if (
    [
      name,
      email,
      password,
      phone,
      organizationName,
      street,
      city,
      state,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  if (!zip) throw new ApiError(400, "All Fields are required");

  let existingUser = await User.findOne({ email });

  if (existingUser && existingUser.role !== "ngo") {
    throw new ApiError(
      400,
      `There Already Exists a ${existingUser.role} with this Email Id Try With Another Email Id`
    );
  } else if (existingUser) {
    throw new ApiError(400, "NGO Already Exists");
  }

  if (!existingUser) {
    existingUser = await User.create({
      name,
      email,
      password,
      phone,
      location: {
        coordinates,
      },
      role: "ngo",
    });
  }

  const existingNGO = await NGO.findOne({
    userId: existingUser._id,
  });

  if (existingNGO) throw new ApiError(400, "NGO Already Exists");

  const ngo = await NGO.create({
    userId: existingUser._id,
    organizationName,
    address: { street, city, state, zip },
    contactPerson: {
      name,
      phone,
      email,
    },
  });


  return res
    .status(201)
    .json(new ApiResponse(200, ngo, "ngo Registered Successfully"));
});

const loginNGO = asyncHandler(async(req,res)=>{
  const { email, password } = req.body;
  
    if (!email) throw new ApiError(400, "Email is Required");
  
    const user = await User.findOne({ email });
  
    if (!user) throw new ApiError(404, "User does not exists");
  
    const isPasswordValid = await user.isPasswordCorrect(password);
  
    if (!isPasswordValid) throw new ApiError(401, "Invalid User Credentials");

    const ngo = await NGO.findOne({userId:user._id});

    if(!ngo) throw new ApiError(404,"ngo does not exists");
  
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
  
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
  
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            ngo,
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User Logged In Successfully"
        )
      );
})

const getVolunteers = asyncHandler(async (req, res) => {
  const user = req.user;
  if(user.role !== "ngo"){
    throw new ApiError(401, "Unauthorized Access");
  }
  const volunteers = await Volunteer.find(); 

  const volunteerList = await Promise.all(
    volunteers.map(async (volunteer) => {
      const user = await User.findById(volunteer.userId);
      return { user, volunteer };
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, volunteerList, "Volunteers Fetched Successfully"));
});

const approveVolunteer = asyncHandler(async (req, res) => {

  const user = req.user;

  if(user.role !== "ngo"){ 
    throw new ApiError(401, "Unauthorized Access");
  }

  const { volunteerId,status } = req.body;
  if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
    throw new ApiError(400, "Invalid Volunteer ID");
  }

  const ngo = await NGO.findOne({ userId: user._id });
  if(!ngo){
    throw new ApiError(404,"NGO Not Found");
  }

  const update = { isVerified: status };
  if (status === true) {
    update.VerifiedBy = ngo._id;
  }

  const volunteer = await Volunteer.findByIdAndUpdate(
    volunteerId,
    update,
    { new: true }
  );

  if (!volunteer) {
    throw new ApiError(404, "Volunteer Not Found");
  }

  await NGO.findOneAndUpdate(
    { userId: user._id },
    { $addToSet: { deliveryPartners: volunteerId } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, volunteer, "Volunteer Approved Successfully"));
});

const getVolunteersDonations = asyncHandler(async (req, res) => {
  const user = req.user;

  if(user.role !== "ngo"){
    throw new ApiError(401, "Unauthorized Access");
  }

  const ngo = await NGO.findOne({userId:user._id});

  if(!ngo){
    throw new ApiError(404,"NGO Not Found");
  }

  const volunteers = await Volunteer.find({VerifiedBy: ngo._id });

  const donationIds = volunteers.map(v => v.assignedDonations).flat();

  const donations = await Donation.find({_id: {$in: donationIds}});

  return res
    .status(200)
    .json(new ApiResponse(200, donations, "Donations Fetched Successfully"));
});

// Get eligible volunteers for a donation (verified, within service radius)
const getEligibleVolunteersForDonation = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.role !== "ngo") {
    throw new ApiError(401, "Unauthorized Access");
  }

  const { donationId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(donationId)) {
    throw new ApiError(400, "Invalid Donation ID");
  }

  const ngo = await NGO.findOne({ userId: user._id });
  if (!ngo) throw new ApiError(404, "NGO Not Found");

  const donation = await Donation.findById(donationId);
  if (!donation) throw new ApiError(404, "Donation Not Found");
  if (donation.status === "picked" || donation.status === "expired") {
    return res.status(200).json(new ApiResponse(200, [], "No eligible volunteers for picked/expired donation"));
  }

  const coords = donation.location?.coordinates;
  if (!coords || coords.length !== 2) {
    throw new ApiError(400, "Donation location not set");
  }

  const volunteers = await Volunteer.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: coords },
        distanceField: "distance",
        spherical: true,
        maxDistance: 100 * 1000,
      },
    },
    { $match: { isVerified: true, VerifiedBy: ngo._id } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $match: {
        $expr: { $lte: ["$distance", { $multiply: ["$serviceRadius", 1000] }] },
      },
    },
    {
      $project: {
        _id: 1,
        distance: 1,
        serviceRadius: 1,
        availability: 1,
        vehicleType: 1,
        user: {
          _id: "$userInfo._id",
          name: "$userInfo.name",
          email: "$userInfo.email",
          phone: "$userInfo.phone",
        },
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, volunteers, "Eligible volunteers fetched"));
});

// Assign a donation to a volunteer (by volunteer userId)
const assignDonation = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.role !== "ngo") {
    throw new ApiError(401, "Unauthorized Access");
  }

  const { donationId, volunteerUserId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(donationId) || !mongoose.Types.ObjectId.isValid(volunteerUserId)) {
    throw new ApiError(400, "Invalid IDs");
  }

  const ngo = await NGO.findOne({ userId: user._id });
  if (!ngo) throw new ApiError(404, "NGO Not Found");

  const donation = await Donation.findById(donationId);
  if (!donation) throw new ApiError(404, "Donation Not Found");
  if (donation.status === "picked" || donation.status === "expired") {
    throw new ApiError(400, "Donation cannot be assigned in current state");
  }
  if (donation.claimedBy) {
    throw new ApiError(400, "Donation is already assigned/claimed");
  }

  const volunteer = await Volunteer.findOne({ userId: volunteerUserId, isVerified: true, VerifiedBy: ngo._id });
  if (!volunteer) throw new ApiError(404, "Volunteer not eligible");

  donation.claimedBy = volunteerUserId; // claimedBy stores userId
  donation.status = "claimed";
  await donation.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, donation, "Donation assigned successfully"));
});

// Get assigned volunteer (user + volunteer) for a donation
const getDonationAssignee = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.role !== "ngo") {
    throw new ApiError(401, "Unauthorized Access");
  }
  const { donationId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(donationId)) {
    throw new ApiError(400, "Invalid Donation ID");
  }
  const donation = await Donation.findById(donationId);
  if (!donation) throw new ApiError(404, "Donation Not Found");
  if (!donation.claimedBy) {
    return res.status(200).json(new ApiResponse(200, null, "Donation not assigned"));
  }
  const userInfo = await User.findById(donation.claimedBy).select("-password -refreshToken");
  if (!userInfo) return res.status(200).json(new ApiResponse(200, null, "Assignee not found"));
  const volunteer = await Volunteer.findOne({ userId: donation.claimedBy });
  return res.status(200).json(new ApiResponse(200, { user: userInfo, volunteer }, "Assignee fetched"));
});


export {
    registerNGO,
    loginNGO,
    approveVolunteer,
    getVolunteers,
  getVolunteersDonations,
  getEligibleVolunteersForDonation,
  assignDonation,
  getDonationAssignee,
}