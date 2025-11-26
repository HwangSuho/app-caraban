import { Response } from "express";
import { RequestWithUser } from "../types/express";

export function firebaseLogin(req: RequestWithUser, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id, email, name, role, firebaseUid, createdAt, updatedAt } = req.user;
  return res.json({
    user: { id, email, name, role, firebaseUid, createdAt, updatedAt },
  });
}

export function kakaoLogin(req: RequestWithUser, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id, email, name, role, firebaseUid, createdAt, updatedAt } = req.user;
  return res.json({
    user: { id, email, name, role, firebaseUid, createdAt, updatedAt },
  });
}
