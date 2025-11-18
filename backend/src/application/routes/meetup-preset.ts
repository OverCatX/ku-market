import { Router } from "express";
import MeetupPresetController from "../controllers/meetup-preset.controller";

const router = Router();
const meetupPresetController = new MeetupPresetController();

// Public route - Get active meetup presets
router.get("/", meetupPresetController.getActivePresets);

export default router;

