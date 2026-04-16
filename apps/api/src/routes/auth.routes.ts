import { Router } from "express";

import { authController } from "../controllers/auth.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireAuth } from "../middlewares/auth.middleware";

export const authRoutes = Router();

authRoutes.post("/signup", asyncHandler((req, res) => authController.signup(req, res)));
authRoutes.post("/login", asyncHandler((req, res) => authController.login(req, res)));
authRoutes.get("/me", requireAuth, asyncHandler((req, res) => authController.me(req, res)));
