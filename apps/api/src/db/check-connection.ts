import { connectDatabase } from "./pool";

export async function checkDatabaseConnection(): Promise<void> {
  try {
    await connectDatabase();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    throw new Error(`Failed to connect to PostgreSQL/Neon: ${message}`);
  }
}
