import type { PublicUser, User } from "../types/entities";

export function toDatabaseDateTime(value: string): string {
  return value;
}

export function fromDatabaseDateTime(value: string | Date | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  return date.toISOString();
}

export function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value == null) {
    return fallback;
  }

  if (typeof value !== "string") {
    return value as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function serializeJsonField(value: unknown): string {
  return JSON.stringify(value ?? []);
}

export function mapUserRow(row: {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string | Date;
  updated_at: string | Date;
}): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: fromDatabaseDateTime(row.created_at) ?? new Date().toISOString(),
    updatedAt: fromDatabaseDateTime(row.updated_at) ?? new Date().toISOString()
  };
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}
