import { Schema, model, models } from "mongoose";

import type { Card } from "../types/entities";

const labelSchema = new Schema(
  {
    id: String,
    name: String,
    color: String
  },
  { _id: false }
);

const memberSchema = new Schema(
  {
    id: String,
    name: String,
    initials: String
  },
  { _id: false }
);

const checklistSchema = new Schema(
  {
    id: String,
    text: String,
    done: Boolean
  },
  { _id: false }
);

const commentSchema = new Schema(
  {
    id: String,
    authorId: String,
    authorName: String,
    text: String,
    createdAt: String
  },
  { _id: false }
);

const activitySchema = new Schema(
  {
    id: String,
    text: String,
    createdAt: String
  },
  { _id: false }
);

const cardSchema = new Schema<Card>(
  {
    id: { type: String, required: true, unique: true },
    listId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dueDate: String,
    labels: { type: [labelSchema], default: [] },
    members: { type: [memberSchema], default: [] },
    checklist: { type: [checklistSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
    activity: { type: [activitySchema], default: [] },
    position: { type: Number, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true }
  },
  { versionKey: false }
);

export const CardModel = models.Card ?? model<Card>("Card", cardSchema);
