import { executeStatement, queryRows } from "../db/pool";
import type { User } from "../types/entities";
import { mapUserRow, toDatabaseDateTime } from "./repository-utils";

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string | Date;
  updated_at: string | Date;
};

export class UserRepository {
  async create(user: User): Promise<void> {
    await executeStatement(
      `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        user.name,
        user.email,
        user.passwordHash,
        toDatabaseDateTime(user.createdAt),
        toDatabaseDateTime(user.updatedAt)
      ]
    );
  }

  async findAll(): Promise<User[]> {
    const rows = await queryRows<UserRow>(
      `SELECT id, name, email, password_hash, created_at, updated_at
       FROM users
       ORDER BY name ASC`
    );
    return rows.map(mapUserRow);
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await queryRows<UserRow>(
      `SELECT id, name, email, password_hash, created_at, updated_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email.toLowerCase()]
    );
    return rows[0] ? mapUserRow(rows[0]) : null;
  }

  async findById(userId: string): Promise<User | null> {
    const rows = await queryRows<UserRow>(
      `SELECT id, name, email, password_hash, created_at, updated_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId]
    );
    return rows[0] ? mapUserRow(rows[0]) : null;
  }
}

export const userRepository = new UserRepository();
