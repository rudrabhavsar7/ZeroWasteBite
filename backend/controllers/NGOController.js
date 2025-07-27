import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { NGO } from "../models/NGO.js";
import { User } from "../models/User.js";

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
    registrationNumber,
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
      registrationNumber,
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
    registrationNumber,
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
            accessToken,
            refreshToken,
          },
          "User Logged In Successfully"
        )
      );
})

export {
    registerNGO,
    loginNGO
}