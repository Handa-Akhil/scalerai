import { Router } from "express";

import { listController } from "../controllers/list.controller";
import { asyncHandler } from "../middlewares/async-handler";
export const listRoutes = Router();

listRoutes.post("/", asyncHandler((req, res) => listController.create(req, res)));
listRoutes.get("/", asyncHandler((req, res) => listController.getAll(req, res)));
listRoutes.get("/:listId", asyncHandler((req, res) => listController.getById(req, res)));
listRoutes.put("/:listId", asyncHandler((req, res) => listController.update(req, res)));
listRoutes.delete("/:listId", asyncHandler((req, res) => listController.remove(req, res)));
