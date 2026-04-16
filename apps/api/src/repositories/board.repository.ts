import { executeStatement, queryRows } from "../db/pool";
import type { Board } from "../types/entities";
import { fromDatabaseDateTime, toDatabaseDateTime } from "./repository-utils";

type BoardRow = {
  id: string;
  owner_id: string | null;
  name: string;
  description: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function mapBoardRow(row: BoardRow): Board {
  return {
    id: row.id,
    ownerId: row.owner_id ?? undefined,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: fromDatabaseDateTime(row.created_at) ?? new Date().toISOString(),
    updatedAt: fromDatabaseDateTime(row.updated_at) ?? new Date().toISOString()
  };
}

export class BoardRepository {
  async create(board: Board): Promise<void> {
    await executeStatement(
      `INSERT INTO boards (id, owner_id, name, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        board.id,
        board.ownerId ?? null,
        board.name,
        board.description ?? null,
        toDatabaseDateTime(board.createdAt),
        toDatabaseDateTime(board.updatedAt)
      ]
    );
  }

  async findAll(): Promise<Board[]> {
    const rows = await queryRows<BoardRow>(
      `SELECT id, owner_id, name, description, created_at, updated_at
       FROM boards
       ORDER BY created_at ASC`
    );
    return rows.map(mapBoardRow);
  }

  async findById(boardId: string): Promise<Board | null> {
    const rows = await queryRows<BoardRow>(
      `SELECT id, owner_id, name, description, created_at, updated_at
       FROM boards
       WHERE id = $1
       LIMIT 1`,
      [boardId]
    );
    return rows[0] ? mapBoardRow(rows[0]) : null;
  }

  async update(board: Board): Promise<void> {
    await executeStatement(
      `UPDATE boards
       SET owner_id = $1, name = $2, description = $3, updated_at = $4
       WHERE id = $5`,
      [
        board.ownerId ?? null,
        board.name,
        board.description ?? null,
        toDatabaseDateTime(board.updatedAt),
        board.id
      ]
    );
  }

  async delete(boardId: string): Promise<boolean> {
    const result = await executeStatement("DELETE FROM boards WHERE id = $1", [boardId]);
    return result.affectedRows > 0;
  }
}

export const boardRepository = new BoardRepository();
