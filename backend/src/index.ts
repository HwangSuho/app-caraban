import app from "./app";
import { env } from "./config/env";
import { initDatabase } from "./models";
import { logger } from "./utils/logger";

async function bootstrap() {
  await initDatabase();

  app.listen(env.port, () => {
    logger.info(`API listening on port ${env.port} (${env.nodeEnv})`);
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to start application", { err });
  process.exit(1);
});
