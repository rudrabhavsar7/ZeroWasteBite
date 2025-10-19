import {Router} from "express";
import { approveVolunteer, assignDonation, getDonationAssignee, getEligibleVolunteersForDonation, getVolunteers, getVolunteersDonations, loginNGO, registerNGO } from "../controllers/NGOController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.post('/register',registerNGO);
router.post('/login',loginNGO);
router.patch('/approve',verifyJWT,approveVolunteer);
router.get('/list',verifyJWT,getVolunteers);
router.get('/donations',verifyJWT,getVolunteersDonations);
router.get('/eligible-volunteers',verifyJWT,getEligibleVolunteersForDonation);
router.get('/donation-assignee',verifyJWT,getDonationAssignee);
router.patch('/assign',verifyJWT,assignDonation);

export default router;