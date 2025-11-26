import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import { env } from "./env";
import { logger } from "../utils/logger";

const ensureSqliteDir = (storage: string) => {
  const dir = path.dirname(storage);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createSequelizeInstance = () => {
  if (env.dbDialect === "sqlite") {
    ensureSqliteDir(env.dbStorage);
    return new Sequelize({
      dialect: "sqlite",
      storage: env.dbStorage,
      logging: env.dbLogging ? (msg) => logger.debug(msg) : false,
    });
  }

  return new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
    host: env.dbHost,
    port: env.dbPort,
    dialect: env.dbDialect,
    logging: env.dbLogging ? (msg) => logger.debug(msg) : false,
  });
};

export const sequelize = createSequelizeInstance();

export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established");
  } catch (err) {
    logger.error("Unable to connect to the database", { err });
    throw err;
  }
}
