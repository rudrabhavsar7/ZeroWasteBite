import {Router} from "express";
import { loginNGO, registerNGO } from "../controllers/NGOController.js";

const router = Router();

router.post('/register',registerNGO);
router.post('/login',loginNGO);


export default router;