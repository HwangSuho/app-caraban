import { Router } from "express";
import { body, param } from "express-validator";
import {
  createReview,
  listReviewsByCampsite,
  updateReview,
  deleteReview,
} from "../controllers/review.controller";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const createValidators = [
  body("campsiteId").isInt().withMessage("campsiteId is required"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("rating must be between 1 and 5"),
  body("comment").optional().isString().isLength({ max: 1000 }),
];

const updateValidators = [
  body("rating").optional().isInt({ min: 1, max: 5 }),
  body("comment").optional().isString().isLength({ max: 1000 }),
];

router.get(
  "/campsite/:campsiteId",
  param("campsiteId").isInt(),
  listReviewsByCampsite
);

router.post("/", firebaseAuth, requireAuth, createValidators, createReview);
router.put(
  "/:id",
  firebaseAuth,
  requireAuth,
  param("id").isInt(),
  updateValidators,
  updateReview
);
router.delete("/:id", firebaseAuth, requireAuth, param("id").isInt(), deleteReview);

export default router;
