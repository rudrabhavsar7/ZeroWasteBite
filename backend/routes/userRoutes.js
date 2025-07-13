import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userControllers.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", verifyJWT, logoutUser);

export default router;
