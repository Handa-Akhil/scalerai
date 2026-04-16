import { Router } from "express";

import { boardController } from "../controllers/board.controller";
import { asyncHandler } from "../middlewares/async-handler";
export const boardRoutes = Router();

boardRoutes.post("/", asyncHandler((req, res) => boardController.create(req, res)));
boardRoutes.get("/", asyncHandler((req, res) => boardController.getAll(req, res)));
boardRoutes.get("/:boardId/details", asyncHandler((req, res) => boardController.getDetails(req, res)));
boardRoutes.get("/:boardId", asyncHandler((req, res) => boardController.getById(req, res)));
boardRoutes.put("/:boardId", asyncHandler((req, res) => boardController.update(req, res)));
boardRoutes.delete("/:boardId", asyncHandler((req, res) => boardController.remove(req, res)));
