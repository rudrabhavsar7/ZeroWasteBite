import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
<<<<<<< HEAD
import {
  addDonation,
  claimDonation,
  updateDonationDetails,
  viewAvailableDonations,
  viewDonations,
  viewUserDonations,
  viewVolunteerAssignedDonations,
} from "../controllers/donationController.js";

const router = Router();

router.post("/add", verifyJWT, addDonation);
router.get("/view/user", verifyJWT, viewUserDonations);
router.get(
  "/view/claimed/",
  verifyJWT,
  viewVolunteerAssignedDonations
);
router.get("/view/all", verifyJWT, viewDonations);
router.get("/view/available", verifyJWT, viewAvailableDonations);
router.patch("/claim", verifyJWT, claimDonation);
router.patch("/update", verifyJWT, updateDonationDetails);
=======
import { addDonation, claimDonation, updateDonationDetails, viewAvailableDonations, viewDonations } from "../controllers/donationController.js";

const router = Router();

router.post("/add",verifyJWT,addDonation);
router.get("/view/all",verifyJWT,viewDonations);
router.get("/view/available",verifyJWT,viewAvailableDonations);
router.patch("/claim",verifyJWT,claimDonation);
router.patch("/update",verifyJWT,updateDonationDetails);
>>>>>>> e7a2da55eca1449d06f41b0cf18c5bd329b22a3a

export default router;
