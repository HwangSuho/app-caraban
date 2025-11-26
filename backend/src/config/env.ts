import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number) =>
  value ? Number(value) || fallback : fallback;

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  dbDialect: (process.env.DB_DIALECT ?? "sqlite") as
    | "sqlite"
    | "mariadb"
    | "mysql",
  dbHost: process.env.DB_HOST ?? "localhost",
  dbPort: toNumber(process.env.DB_PORT, 3306),
  dbName: process.env.DB_NAME ?? "caraban",
  dbUser: process.env.DB_USER ?? "caraban",
  dbPassword: process.env.DB_PASSWORD ?? "",
  dbStorage: process.env.DB_STORAGE ?? "./data/dev.sqlite",
  dbLogging: (process.env.DB_LOGGING ?? "false").toLowerCase() === "true",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY ?? "",
  kakaoNativeKey: process.env.KAKAO_NATIVE_KEY ?? "",
  kakaoRestApiKey: process.env.KAKAO_REST_API_KEY ?? "",
  kakaoJavascriptKey: process.env.KAKAO_JAVASCRIPT_KEY ?? "",
  kakaoAdminKey: process.env.KAKAO_ADMIN_KEY ?? "",
  logLevel: process.env.LOG_LEVEL ?? "info",
};
