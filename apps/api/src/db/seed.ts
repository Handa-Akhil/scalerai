import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

import { closeDatabase, connectDatabase, executeStatement, queryRows } from "./pool";
import { initializeSchema } from "./schema";
import { toDatabaseDateTime } from "../repositories/repository-utils";

async function runSeed() {
  const boardId = randomUUID();
  const list1Id = randomUUID();
  const list2Id = randomUUID();
  const list3Id = randomUUID();
  const now = new Date().toISOString();

  try {
    await connectDatabase();
    await initializeSchema();

    const existingBoard = await queryRows<{ id: string }>("SELECT id FROM boards LIMIT 1");
    if (existingBoard.length > 0) {
      console.log("Seed skipped: a board already exists.");
      return;
    }

    const users = [
      { id: randomUUID(), name: "Akhil Handa", email: "akhil@example.com" },
      { id: randomUUID(), name: "Riya Sharma", email: "riya@example.com" },
      { id: randomUUID(), name: "Dev Patel", email: "dev@example.com" }
    ];

    for (const user of users) {
      await executeStatement(
        `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.id,
          user.name,
          user.email,
          await bcrypt.hash("Demo1234", 10),
          toDatabaseDateTime(now),
          toDatabaseDateTime(now)
        ]
      );
    }

    await executeStatement(
      `INSERT INTO boards (id, owner_id, name, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        boardId,
        users[0]?.id ?? null,
        "Product Roadmap",
        "Main workspace for sprint planning and delivery tracking.",
        toDatabaseDateTime(now),
        toDatabaseDateTime(now)
      ]
    );

    for (const user of users) {
      await executeStatement(
        `INSERT INTO board_members (board_id, user_id, created_at)
         VALUES ($1, $2, $3)`,
        [boardId, user.id, toDatabaseDateTime(now)]
      );
    }

    const lists = [
      { id: list1Id, title: "Backlog", position: 1024 },
      { id: list2Id, title: "In Progress", position: 2048 },
      { id: list3Id, title: "Done", position: 3072 }
    ];

    for (const list of lists) {
      await executeStatement(
        `INSERT INTO lists (id, board_id, title, position, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [list.id, boardId, list.title, list.position, toDatabaseDateTime(now), toDatabaseDateTime(now)]
      );
    }

    const cards = [
      {
        listId: list1Id,
        title: "Finalize Trello-style board layout",
        description: "Match Trello spacing, list width, and quick-add behavior.",
        position: 1024,
        labels: [{ id: randomUUID(), name: "Design", color: "bg-blue-500" }],
        members: [{ id: users[0]!.id, name: users[0]!.name, initials: "AH" }],
        checklist: [
          { id: randomUUID(), text: "Header layout", done: true },
          { id: randomUUID(), text: "List composer", done: false }
        ],
        dueDate: new Date(Date.now() + 86400000).toISOString()
      },
      {
        listId: list2Id,
        title: "Wire board CRUD to PostgreSQL",
        description: "Persist boards, lists, cards, and card metadata in Neon PostgreSQL.",
        position: 1024,
        labels: [{ id: randomUUID(), name: "Backend", color: "bg-green-500" }],
        members: [
          { id: users[1]!.id, name: users[1]!.name, initials: "RS" },
          { id: users[2]!.id, name: users[2]!.name, initials: "DP" }
        ],
        checklist: [{ id: randomUUID(), text: "Create schema", done: true }],
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString()
      },
      {
        listId: list3Id,
        title: "Seed a sample planning board",
        description: "Ship sample members, lists, labels, and due dates for demo readiness.",
        position: 1024,
        labels: [{ id: randomUUID(), name: "Ready", color: "bg-amber-500" }],
        members: [{ id: users[0]!.id, name: users[0]!.name, initials: "AH" }],
        checklist: [],
        dueDate: new Date().toISOString()
      }
    ];

    for (const card of cards) {
      const activity = [
        { id: randomUUID(), text: "Card created", createdAt: now }
      ];

      await executeStatement(
        `INSERT INTO cards (
          id, list_id, title, description, due_date, labels, members, checklist, comments, activity, position, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11, $12, $13)`,
        [
          randomUUID(),
          card.listId,
          card.title,
          card.description,
          toDatabaseDateTime(card.dueDate),
          JSON.stringify(card.labels),
          JSON.stringify(card.members),
          JSON.stringify(card.checklist),
          JSON.stringify([]),
          JSON.stringify(activity),
          card.position,
          toDatabaseDateTime(now),
          toDatabaseDateTime(now)
        ]
      );
    }

    console.log("Seed successful");
  } catch (err) {
    console.error("Seed failed", err);
  } finally {
    await closeDatabase();
  }
}

void runSeed();
