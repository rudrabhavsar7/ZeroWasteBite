import { loadRiskModel, loadSafeHoursModel, predictRiskLevel, predictSafeHours } from "../mlModel/riskModel.js";
import asyncHandler from "../utils/asyncHandler.js";

export const predictRisk = asyncHandler(async (req, res) => {
  try {
    await loadRiskModel();
    const prediction = await predictRiskLevel(req.body);
    res.json({ prediction });
  } catch (err) {
    console.error("Prediction Error:", err);
    res.status(500).json({ error: "Prediction failed." });
  }
});

export const predictSafe = asyncHandler(async (req, res) => {
  await loadSafeHoursModel();
  try {
    const safeHours = await predictSafeHours(req.body);
    res.json({ safe_hours: safeHours });
  } catch (err) {
    console.error("Safe Hours Prediction Error:", err);
    res.status(500).json({ error: "Prediction failed." });
  }
});