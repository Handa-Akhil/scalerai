import { Schema, model, models } from "mongoose";

import type { Board } from "../types/entities";

const boardSchema = new Schema<Board>(
  {
    id: { type: String, required: true, unique: true },
    ownerId: { type: String, required: true, index: true },
    memberIds: { type: [String], default: [] },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true }
  },
  { versionKey: false }
);

export const BoardModel = models.Board ?? model<Board>("Board", boardSchema);
