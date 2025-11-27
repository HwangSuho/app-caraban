import cors from "cors";
import express from "express";
import helmet from "helmet";
import routes from "./routes";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { logger } from "./utils/logger";

const app = express();

const corsOrigins = env.corsOrigin
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const allowAllOrigins = corsOrigins.includes("*");

app.use(helmet());
app.use(
  cors({
    origin: allowAllOrigins
      ? true // echo request origin (needed when credentials: true)
      : (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          if (!origin) return callback(null, true);
          if (corsOrigins.includes(origin)) return callback(null, true);
          logger.warn("CORS blocked request from origin", { origin });
          return callback(null, false);
        },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
