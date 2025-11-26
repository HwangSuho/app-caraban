import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { env } from "../config/env";

const logDir = path.resolve(process.cwd(), "logs");

const formatter = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const base = `${timestamp} [${level}]: ${message}`;
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${base}${extra}`;
  })
);

export const logger = winston.createLogger({
  level: env.logLevel,
  format: formatter,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const base = `${timestamp} [${level}]: ${message}`;
          const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
          return `${base}${extra}`;
        })
      ),
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: "combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      level: env.logLevel,
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      level: "error",
    }),
  ],
});
