import { Router } from "express";
import { body, param } from "express-validator";
import {
  cancelReservation,
  createReservation,
  getReservation,
  listMyReservations,
} from "../controllers/reservation.controller";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const createValidators = [
  body("campsiteId").isInt().withMessage("campsiteId is required"),
  body("startDate").isISO8601().toDate().withMessage("startDate is required"),
  body("endDate").isISO8601().toDate().withMessage("endDate is required"),
];

router.use(firebaseAuth, requireAuth);

router.get("/me", listMyReservations);
router.get("/:id", param("id").isInt(), getReservation);
router.post("/", createValidators, createReservation);
router.post("/:id/cancel", param("id").isInt(), cancelReservation);

export default router;
