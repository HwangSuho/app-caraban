import { Request, Response } from "express";

export function healthCheck(_req: Request, res: Response) {
  return res.json({ status: "ok" });
}
