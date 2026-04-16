import { Pool, type QueryResult, type QueryResultRow } from "pg";

import { env } from "../config/env";

let pool: Pool | null = null;
type SqlValue = string | number | boolean | Date | null;

function isPlaceholderConnectionString(connectionString: string): boolean {
  return connectionString.includes("username:password@") || connectionString.includes("ep-example");
}

function normalizeConnectionString(connectionString: string): string {
  const url = new URL(connectionString);
  url.searchParams.delete("sslmode");
  return url.toString();
}

function shouldUseSsl(connectionString: string): boolean {
  return !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1");
}

export async function connectDatabase(): Promise<void> {
  if (pool) {
    return;
  }

  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required for PostgreSQL/Neon");
  }

  if (isPlaceholderConnectionString(env.databaseUrl)) {
    throw new Error("Replace the sample DATABASE_URL in apps/api/.env with your real Neon PostgreSQL connection string.");
  }

  pool = new Pool({
    connectionString: normalizeConnectionString(env.databaseUrl),
    ssl: shouldUseSsl(env.databaseUrl) ? { rejectUnauthorized: false } : undefined
  });

  await pool.query("SELECT 1");
}

export async function getDatabase(): Promise<Pool> {
  await connectDatabase();

  if (!pool) {
    throw new Error("Database pool was not initialized");
  }

  return pool;
}

export async function queryRows<T extends QueryResultRow>(
  sql: string,
  params: SqlValue[] = []
): Promise<T[]> {
  const database = await getDatabase();
  const result = await database.query<T>(sql, params);
  return result.rows;
}

export async function executeStatement(
  sql: string,
  params: SqlValue[] = []
): Promise<{ affectedRows: number }> {
  const database = await getDatabase();
  const result = await database.query(sql, params);
  return { affectedRows: result.rowCount ?? 0 };
}

export async function rawQuery<T extends QueryResultRow>(
  sql: string,
  params: SqlValue[] = []
): Promise<QueryResult<T>> {
  const database = await getDatabase();
  return database.query<T>(sql, params);
}

export async function closeDatabase(): Promise<void> {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
}
