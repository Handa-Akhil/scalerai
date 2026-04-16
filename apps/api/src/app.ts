import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorMiddleware } from "./middlewares/error.middleware";
import { AppError } from "./utils/app-error";
import { boardRoutes } from "./routes/board.routes";
import { listRoutes } from "./routes/list.routes";
import { cardRoutes } from "./routes/card.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/boards", boardRoutes);
app.use("/api/v1/lists", listRoutes);
app.use("/api/v1/cards", cardRoutes);

app.use((_req, _res, next) => {
  next(new AppError(404, "Route not found", "NOT_FOUND"));
});

app.use(errorMiddleware);
