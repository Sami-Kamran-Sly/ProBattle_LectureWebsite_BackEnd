import express from "express";

const router = express.Router();
import { requireSignIn } from "../middleware/auth.js";
import {
  registerController,
  loginController,
  forgotPasswordController,
} from "../controller/authController.js";

router.route("/register").post(registerController);
router.route("/login").post(loginController);
router.post("/forgot-password", forgotPasswordController);

router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
export default router;
