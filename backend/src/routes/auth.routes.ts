import { Router } from "express";
import { firebaseLogin, kakaoLogin } from "../controllers/auth.controller";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { kakaoAuth } from "../middlewares/kakaoAuth";

const router = Router();

router.post("/firebase", firebaseAuth, firebaseLogin);
router.post("/kakao", kakaoAuth, kakaoLogin);

export default router;
