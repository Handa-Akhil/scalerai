import { executeStatement, queryRows } from "../db/pool";
import type { List } from "../types/entities";
import { fromDatabaseDateTime, toDatabaseDateTime } from "./repository-utils";

type ListRow = {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string | Date;
  updated_at: string | Date;
};

function mapListRow(row: ListRow): List {
  return {
    id: row.id,
    boardId: row.board_id,
    title: row.title,
    position: Number(row.position),
    createdAt: fromDatabaseDateTime(row.created_at) ?? new Date().toISOString(),
    updatedAt: fromDatabaseDateTime(row.updated_at) ?? new Date().toISOString()
  };
}

export class ListRepository {
  async create(list: List): Promise<void> {
    await executeStatement(
      `INSERT INTO lists (id, board_id, title, position, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        list.id,
        list.boardId,
        list.title,
        list.position,
        toDatabaseDateTime(list.createdAt),
        toDatabaseDateTime(list.updatedAt)
      ]
    );
  }

  async findAll(): Promise<List[]> {
    const rows = await queryRows<ListRow>(
      `SELECT id, board_id, title, position, created_at, updated_at
       FROM lists
       ORDER BY position ASC`
    );
    return rows.map(mapListRow);
  }

  async findByBoardId(boardId: string): Promise<List[]> {
    const rows = await queryRows<ListRow>(
      `SELECT id, board_id, title, position, created_at, updated_at
       FROM lists
       WHERE board_id = $1
       ORDER BY position ASC`,
      [boardId]
    );
    return rows.map(mapListRow);
  }

  async findById(listId: string): Promise<List | null> {
    const rows = await queryRows<ListRow>(
      `SELECT id, board_id, title, position, created_at, updated_at
       FROM lists
       WHERE id = $1
       LIMIT 1`,
      [listId]
    );
    return rows[0] ? mapListRow(rows[0]) : null;
  }

  async exists(listId: string): Promise<boolean> {
    const rows = await queryRows<{ id: string }>(
      "SELECT id FROM lists WHERE id = $1 LIMIT 1",
      [listId]
    );
    return rows.length > 0;
  }

  async update(list: List): Promise<void> {
    await executeStatement(
      `UPDATE lists
       SET title = $1, position = $2, updated_at = $3
       WHERE id = $4`,
      [list.title, list.position, toDatabaseDateTime(list.updatedAt), list.id]
    );
  }

  async delete(listId: string): Promise<boolean> {
    const result = await executeStatement("DELETE FROM lists WHERE id = $1", [listId]);
    return result.affectedRows > 0;
  }
}

export const listRepository = new ListRepository();
