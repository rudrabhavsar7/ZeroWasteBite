import {Router} from "express"
import { predictRisk, predictSafe } from "../controllers/modelController.js";

const router = Router();

router.post('/risk',predictRisk);
router.post('/safe-hours',predictSafe);

export default router;