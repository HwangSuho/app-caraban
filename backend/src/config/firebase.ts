import admin from "firebase-admin";
import { env } from "./env";
import { logger } from "../utils/logger";

const sanitizeFirebasePrivateKey = (key: string) =>
  key
    // Remove accidental surrounding quotes when the secret is injected as JSON string
    .replace(/^['"](.+)['"]$/s, "$1")
    // Support newline escape sequences from .env / CI secrets
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r");

if (!admin.apps.length) {
  if (!env.firebaseProjectId || !env.firebaseClientEmail || !env.firebasePrivateKey) {
    logger.warn(
      "Firebase credentials are missing; Firebase-admin features will not work until configured."
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: sanitizeFirebasePrivateKey(env.firebasePrivateKey),
      }),
    });
    logger.info("Firebase admin initialized");
  }
}

export { admin };
