import {
  loadRiskModel,
  loadSafeHoursModel,
  predictRiskLevel,
  predictSafeHours,
} from "../mlModel/riskModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const predictRisk = asyncHandler(async (req, res) => {
  try {
    await loadRiskModel();
    const prediction = await predictRiskLevel(req.body);

    if (!prediction) throw new ApiError(500, "Prediction Error");
    res.status(200).json(new ApiResponse(200, prediction, "Predicted Risk"));
  } catch (err) {
    console.error("Prediction Error:", err);
    res.status(500).json({ error: "Prediction failed." });
  }
});

export const predictSafe = asyncHandler(async (req, res) => {
  try {
    await loadSafeHoursModel();
    const safeHours = await predictSafeHours(req.body);

    if (!safeHours) throw new ApiError(500, "Prediction Error");
    res
      .status(200)
      .json(new ApiResponse(200, safeHours, "Predicted Safe Hours"));
  } catch (err) {
    console.error("Safe Hours Prediction Error:", err);
    res.status(500).json({ error: "Prediction failed." });
  }
});
