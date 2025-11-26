import https from "node:https";
import { NextFunction, Request, Response } from "express";
import { findOrCreateUserFromKakao } from "../services/user.service";
import { logger } from "../utils/logger";

interface KakaoProfileResponse {
  id: number | string;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
    };
  };
}

const KAKAO_USER_API_PATH = "/v2/user/me";

function fetchKakaoProfile(accessToken: string) {
  return new Promise<KakaoProfileResponse>((resolve, reject) => {
    const req = https.request(
      {
        protocol: "https:",
        hostname: "kapi.kakao.com",
        path: KAKAO_USER_API_PATH,
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(err);
            }
          } else {
            const err = new Error(
              `Kakao responded with status ${res.statusCode ?? "unknown"}`
            );
            (err as Error & { responseBody?: string }).responseBody = data;
            reject(err);
          }
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(5000, () => {
      req.destroy(new Error("Kakao request timed out"));
    });
    req.end();
  });
}

export async function kakaoAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    const accessToken = authHeader.split(" ")[1];
    const kakaoProfile = await fetchKakaoProfile(accessToken);

    const user = await findOrCreateUserFromKakao({
      id: String(kakaoProfile.id),
      email: kakaoProfile.kakao_account?.email,
      nickname: kakaoProfile.kakao_account?.profile?.nickname,
    });

    req.user = user;
    return next();
  } catch (err) {
    logger.warn("Kakao auth failed", { err });
    return res.status(401).json({ message: "Invalid or expired auth token" });
  }
}
