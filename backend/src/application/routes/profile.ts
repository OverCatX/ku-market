import { Router} from "express";
import { authenticate } from "../middlewares/authentication";
import ProfileController from "../controllers/profile.controller";
import { validateUpdateProfile } from "../middlewares/validators/profile.validation";
import { upload } from "../../lib/upload";

const router = Router();
const profilecontroller = new ProfileController();

// View Profile
router.get("/view", authenticate, profilecontroller.userView);

// Update Profile (with optional profile picture upload)
router.put("/update", authenticate, upload.single("profilePicture"), validateUpdateProfile, profilecontroller.userUpdate);

export default router;
