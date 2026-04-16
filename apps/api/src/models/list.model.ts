import { Schema, model, models } from "mongoose";

import type { List } from "../types/entities";

const listSchema = new Schema<List>(
  {
    id: { type: String, required: true, unique: true },
    boardId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    position: { type: Number, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true }
  },
  { versionKey: false }
);

export const ListModel = models.List ?? model<List>("List", listSchema);
