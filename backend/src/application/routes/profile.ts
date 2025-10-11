import { Router} from "express";
import { authenticate } from "../middlewares/authentication";
import ProfileController from "../controllers/profile.controller";
import { validateUpdateProfile } from "../middlewares/validators/profile.validation";

const router = Router();
const profilecontroller = new ProfileController();

// View Profile
router.get("/view", authenticate, profilecontroller.userView);

// Update Profile
router.put("/update", authenticate, validateUpdateProfile, profilecontroller.userUpdate);

export default router;
