import express from "express";
import { registerCustomer } from "../controllers/customer.controller.js";
import { loginCustomer } from "../controllers/customer.controller.js";
import { getMyProfile } from "../controllers/customer.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { logoutCustomer } from "../controllers/customer.controller.js";
import { changePassword } from "../controllers/customer.controller.js";
const router = express.Router();

router.post("/register", registerCustomer)
router.post("/login", loginCustomer)
router.get("/me", authMiddleware, getMyProfile)
router.post("/logout", authMiddleware, logoutCustomer)
router.patch("/change-password", authMiddleware, changePassword)

export default router