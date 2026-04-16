import { closeDatabase, connectDatabase } from "./pool";
import { initializeSchema } from "./schema";

async function initDb(): Promise<void> {
  try {
    console.log("Initializing PostgreSQL/Neon tables...");

    await connectDatabase();
    await initializeSchema();
    console.log("PostgreSQL/Neon schema initialized successfully.");

  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

void initDb();
