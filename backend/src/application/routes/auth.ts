import { Router} from "express";
import AuthController from "../controllers/auth.controller";
import {userSignup, userLogin} from "../middlewares/validators/auth.validation";

const router = Router();
const authController = new AuthController();

// Signup
router.post("/signup", userSignup, authController.userSignup)

// Login
router.post("/login", userLogin, authController.userLogin)

export default router;
