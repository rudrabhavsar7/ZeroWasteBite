import * as ort from "onnxruntime-node";
import path from "path";
import { fileURLToPath } from "url";

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Model path relative to this file
const modelPath1 = path.join(__dirname, "risk_classifier.onnx");
const modelPath2 = path.join(__dirname, "safe_hours_regressor.onnx");

let session = null;

export const loadRiskModel = async () => {
  try {
    session = await ort.InferenceSession.create(modelPath1);
    console.log("✅ ONNX risk model loaded.");
  } catch (error) {
    console.error("❌ Failed to load ONNX model:", error);
    throw error;
  }
};

export const loadSafeHoursModel = async () => {
  try {
    session = await ort.InferenceSession.create(modelPath2);
    console.log("✅ ONNX risk model loaded.");
  } catch (error) {
    console.error("❌ Failed to load ONNX model:", error);
    throw error;
  }
};

const preprocess = (input) => {
  return {
    food_type: new ort.Tensor("string", [input.food_type], [1, 1]),
    storage: new ort.Tensor("string", [input.storage], [1, 1]),
    environment: new ort.Tensor("string", [input.environment], [1, 1]),
    is_sealed: new ort.Tensor("float32", [input.is_sealed ? 1 : 0], [1, 1]),
    time_since_prep: new ort.Tensor(
      "float32",
      [parseFloat(input.time_since_prep)],
      [1, 1]
    ),
    confidence: new ort.Tensor(
      "float32",
      [parseFloat(input.confidence)],
      [1, 1]
    ),
  };
};

export const predictRiskLevel = async (input) => {
  if (!session) throw new Error("Model not loaded.");

  const feeds = preprocess(input);
  const outputName = session.outputNames[0];
  const results = await session.run(feeds);

  const prediction = results[outputName].data[0];
  return prediction;
};

export const predictSafeHours = async (input) => {
  if (!session) throw new Error("Model not loaded");

  const feeds = preprocess(input);
  const outputName = session.outputNames[0];

  const results = await session.run(feeds);
  const safeHours = Math.floor(results[outputName].data[0]); // Predicted float
  
  return safeHours;
};