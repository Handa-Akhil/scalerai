import { executeStatement, queryRows } from "../db/pool";
import type { Card } from "../types/entities";
import {
  fromDatabaseDateTime,
  parseJsonField,
  serializeJsonField,
  toDatabaseDateTime
} from "./repository-utils";

type CardRow = {
  id: string;
  list_id: string;
  title: string;
  description: string | null;
  due_date: string | Date | null;
  labels: string;
  members: string;
  checklist: string;
  comments: string;
  activity: string;
  position: number;
  created_at: string | Date;
  updated_at: string | Date;
};

function mapCardRow(row: CardRow): Card {
  return {
    id: row.id,
    listId: row.list_id,
    title: row.title,
    description: row.description ?? undefined,
    dueDate: fromDatabaseDateTime(row.due_date),
    labels: parseJsonField(row.labels, []),
    members: parseJsonField(row.members, []),
    checklist: parseJsonField(row.checklist, []),
    comments: parseJsonField(row.comments, []),
    activity: parseJsonField(row.activity, []),
    position: Number(row.position),
    createdAt: fromDatabaseDateTime(row.created_at) ?? new Date().toISOString(),
    updatedAt: fromDatabaseDateTime(row.updated_at) ?? new Date().toISOString()
  };
}

export class CardRepository {
  async create(card: Card): Promise<void> {
    await executeStatement(
      `INSERT INTO cards (
         id, list_id, title, description, due_date, labels, members, checklist, comments, activity, position, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11, $12, $13)`,
      [
        card.id,
        card.listId,
        card.title,
        card.description ?? null,
        card.dueDate ? toDatabaseDateTime(card.dueDate) : null,
        serializeJsonField(card.labels ?? []),
        serializeJsonField(card.members ?? []),
        serializeJsonField(card.checklist ?? []),
        serializeJsonField(card.comments ?? []),
        serializeJsonField(card.activity ?? []),
        card.position,
        toDatabaseDateTime(card.createdAt),
        toDatabaseDateTime(card.updatedAt)
      ]
    );
  }

  async findAll(): Promise<Card[]> {
    const rows = await queryRows<CardRow>(
      `SELECT id, list_id, title, description, due_date, labels, members, checklist, comments, activity, position, created_at, updated_at
       FROM cards
       ORDER BY position ASC`
    );
    return rows.map(mapCardRow);
  }

  async findByBoardId(boardId: string): Promise<Card[]> {
    const rows = await queryRows<CardRow>(
      `SELECT c.id, c.list_id, c.title, c.description, c.due_date, c.labels, c.members, c.checklist, c.comments, c.activity, c.position, c.created_at, c.updated_at
       FROM cards c
       INNER JOIN lists l ON l.id = c.list_id
       WHERE l.board_id = $1
       ORDER BY c.position ASC`,
      [boardId]
    );
    return rows.map(mapCardRow);
  }

  async findById(cardId: string): Promise<Card | null> {
    const rows = await queryRows<CardRow>(
      `SELECT id, list_id, title, description, due_date, labels, members, checklist, comments, activity, position, created_at, updated_at
       FROM cards
       WHERE id = $1
       LIMIT 1`,
      [cardId]
    );
    return rows[0] ? mapCardRow(rows[0]) : null;
  }

  async findByListId(listId: string, excludeCardId?: string): Promise<{ id: string; position: number }[]> {
    const rows = await queryRows<{ id: string; position: number }>(
      `SELECT id, position
       FROM cards
       WHERE list_id = $1 ${excludeCardId ? "AND id <> $2" : ""}
       ORDER BY position ASC`,
      excludeCardId ? [listId, excludeCardId] : [listId]
    );
    return rows.map((row) => ({ id: row.id, position: Number(row.position) }));
  }

  async updatePositions(items: { id: string; position: number }[]): Promise<void> {
    await Promise.all(
      items.map((item) =>
        executeStatement("UPDATE cards SET position = $1 WHERE id = $2", [item.position, item.id])
      )
    );
  }

  async update(card: Card): Promise<void> {
    await executeStatement(
      `UPDATE cards
       SET list_id = $1, title = $2, description = $3, due_date = $4, labels = $5::jsonb, members = $6::jsonb, checklist = $7::jsonb, comments = $8::jsonb, activity = $9::jsonb, position = $10, updated_at = $11
       WHERE id = $12`,
      [
        card.listId,
        card.title,
        card.description ?? null,
        card.dueDate ? toDatabaseDateTime(card.dueDate) : null,
        serializeJsonField(card.labels ?? []),
        serializeJsonField(card.members ?? []),
        serializeJsonField(card.checklist ?? []),
        serializeJsonField(card.comments ?? []),
        serializeJsonField(card.activity ?? []),
        card.position,
        toDatabaseDateTime(card.updatedAt),
        card.id
      ]
    );
  }

  async delete(cardId: string): Promise<boolean> {
    const result = await executeStatement("DELETE FROM cards WHERE id = $1", [cardId]);
    return result.affectedRows > 0;
  }
}

export const cardRepository = new CardRepository();
