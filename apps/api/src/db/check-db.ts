import { checkDatabaseConnection } from "./check-connection";
import { closeDatabase } from "./pool";

async function run(): Promise<void> {
  try {
    await checkDatabaseConnection();
    // eslint-disable-next-line no-console
    console.log("PostgreSQL/Neon connection successful.");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    // eslint-disable-next-line no-console
    console.error(message);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

void run();
