import { Router } from "express";

import { cardController } from "../controllers/card.controller";
import { asyncHandler } from "../middlewares/async-handler";
export const cardRoutes = Router();

cardRoutes.post("/", asyncHandler((req, res) => cardController.create(req, res)));
cardRoutes.get("/", asyncHandler((req, res) => cardController.getAll(req, res)));
cardRoutes.get("/:cardId", asyncHandler((req, res) => cardController.getById(req, res)));
cardRoutes.put("/:cardId", asyncHandler((req, res) => cardController.update(req, res)));
cardRoutes.patch("/:cardId/move", asyncHandler((req, res) => cardController.move(req, res)));
cardRoutes.delete("/:cardId", asyncHandler((req, res) => cardController.remove(req, res)));
