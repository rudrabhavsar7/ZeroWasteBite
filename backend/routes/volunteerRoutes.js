import { Router } from "express";
import { loginVolunteer, registerVolunteer } from "../controllers/volunteerController.js";

const router = Router();

router.post('/register',registerVolunteer);
router.post('/login',loginVolunteer);

export default router;