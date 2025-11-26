import { User } from "../models";
import { logger } from "../utils/logger";

export interface FirebaseProfile {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface KakaoProfile {
  id: string;
  email?: string;
  nickname?: string;
}

export async function findOrCreateUserFromFirebase(profile: FirebaseProfile) {
  try {
    const [user] = await User.findOrCreate({
      where: { firebaseUid: profile.uid },
      defaults: {
        firebaseUid: profile.uid,
        email: profile.email ?? null,
        name: profile.name ?? profile.email?.split("@")[0] ?? "camper",
      },
    });

    if (!user.email && profile.email) {
      user.email = profile.email;
      await user.save();
    }

    return user;
  } catch (err) {
    logger.error("Failed to find/create user from firebase profile", { err });
    throw err;
  }
}

export async function findOrCreateUserFromKakao(profile: KakaoProfile) {
  try {
    const externalId = `kakao:${profile.id}`;
    const [user] = await User.findOrCreate({
      where: { firebaseUid: externalId },
      defaults: {
        firebaseUid: externalId,
        email: profile.email ?? null,
        name:
          profile.nickname ??
          profile.email?.split("@")[0] ??
          `kakao-user-${profile.id}`,
      },
    });

    if (!user.email && profile.email) {
      user.email = profile.email;
      await user.save();
    }

    if (!user.name && profile.nickname) {
      user.name = profile.nickname;
      await user.save();
    }

    return user;
  } catch (err) {
    logger.error("Failed to find/create user from kakao profile", { err });
    throw err;
  }
}
