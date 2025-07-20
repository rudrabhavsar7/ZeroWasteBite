import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { addDonation } from "../controllers/donationController.js";

const router = Router();

router.post("/add",verifyJWT,addDonation);

export default router;