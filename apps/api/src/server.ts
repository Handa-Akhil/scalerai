import { env } from "./config/env";
import { connectDatabase } from "./db/pool";
import { app } from "./app";

async function bootstrap(): Promise<void> {
  await connectDatabase();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${env.port}`);
  });
}

bootstrap().catch((error: Error) => {
  // eslint-disable-next-line no-console
  console.error(error.message);
  process.exit(1);
});
