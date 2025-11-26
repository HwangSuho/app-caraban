import { NextFunction, Request, Response } from "express";
import { admin } from "../config/firebase";
import { findOrCreateUserFromFirebase } from "../services/user.service";
import { logger } from "../utils/logger";

export async function firebaseAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    const idToken = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    const user = await findOrCreateUserFromFirebase({
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    });

    req.user = user;
    return next();
  } catch (err) {
    logger.warn("Firebase auth failed", { err });
    return res.status(401).json({ message: "Invalid or expired auth token" });
  }
}
