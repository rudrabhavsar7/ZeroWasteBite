import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/userControllers.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", verifyJWT, logoutUser);

router.post("/refresh-token", refreshAccessToken);

export default router;
