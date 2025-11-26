import { Router } from "express";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import campsiteRoutes from "./campsites.routes";
import reservationRoutes from "./reservations.routes";
import reviewRoutes from "./reviews.routes";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/campsites", campsiteRoutes);
router.use("/reservations", reservationRoutes);
router.use("/reviews", reviewRoutes);

export default router;
