import { randomUUID } from "crypto";
import type { Board, Card, List, User } from "../types/entities";

const defaultBoardId = randomUUID();
const list1Id = randomUUID();
const list2Id = randomUUID();
const list3Id = randomUUID();
export const demoUserId = randomUUID();

export const userStore: User[] = [
  {
    id: demoUserId,
    name: "Demo User",
    email: "demo@example.com",
    passwordHash: "$2b$10$.q1J81y16R3mn87WEibOBuIzkf.0V55EbaGLGoxFrD4o3dGRuDCZi",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const boardStore: Board[] = [
  {
    id: defaultBoardId,
    ownerId: demoUserId,
    memberIds: [demoUserId],
    name: "🚀 Product Roadmap",
    description: "Main workspace for product development",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const listStore: List[] = [
  {
    id: list1Id,
    boardId: defaultBoardId,
    title: "To Do",
    position: 1024,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: list2Id,
    boardId: defaultBoardId,
    title: "In Progress",
    position: 2048,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: list3Id,
    boardId: defaultBoardId,
    title: "Done",
    position: 3072,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const cardStore: Card[] = [
  {
    id: randomUUID(),
    listId: list1Id,
    title: "Design new landing page",
    description: "Create premium glassmorphic UI components",
    position: 1024,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: randomUUID(),
    listId: list1Id,
    title: "Set up MongoDB Atlas",
    description: "Use the Atlas cluster as the API database",
    position: 2048,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: randomUUID(),
    listId: list2Id,
    title: "Implement drag and drop",
    description: "Use dnd-kit for cards and lists",
    position: 1024,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: randomUUID(),
    listId: list3Id,
    title: "Project Initialization",
    description: "Set up Turborepo and Next.js 15 apps",
    position: 1024,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
