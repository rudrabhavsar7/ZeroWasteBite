import { Volunteer } from "../models/Volunteer.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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

const registerVolunteer = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    coordinates,
    availability,
    vehicleType,
    serviceRadius,
  } = req.body;

  if (
    [name, email, password, phone, availability, vehicleType].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  let existingUser = await User.findOne({ email });

  if(existingUser && existingUser.role !== "volunteer"){
    throw new ApiError(400, `There Already Exists a ${existingUser.role} with this Email Id Try With Another Email Id`);
  }else if(existingUser){
    throw new ApiError(400,"Volunteer Already Exists");
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
      role: "volunteer",
    });
  }

  const existingVolunteer = await Volunteer.findOne({
    userId: existingUser._id,
  });

  if (existingVolunteer) throw new ApiError(400, "Volunteer Already Exists");

  const volunteer = await Volunteer.create({
    userId: existingUser._id,
    availability,
    vehicleType,
    serviceRadius,
    location: { coordinates },
  });

  return res
    .status(201)
    .json(new ApiResponse(200, volunteer, "Volunteer Registered Successfully"));
});

const loginVolunteer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) throw new ApiError(400, "Email is Required");

  const user = await User.findOne({ email });

  if (!user) throw new ApiError(404, "User does not exists");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid User Credentials");

  const volunteer = await Volunteer.findOne({ userId: user._id });

  if (!volunteer) throw new ApiError(404, "Volunteer does not exists");

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
          volunteer,
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});

export { registerVolunteer, loginVolunteer };
