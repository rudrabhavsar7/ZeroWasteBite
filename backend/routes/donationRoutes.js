import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { addDonation, claimDonation, viewAvailableDonations, viewDonations } from "../controllers/donationController.js";

const router = Router();

router.post("/add",verifyJWT,addDonation);
router.get("/view/all",verifyJWT,viewDonations);
router.get("/view/available",verifyJWT,viewAvailableDonations);
router.patch("/claim",verifyJWT,claimDonation);

export default router;