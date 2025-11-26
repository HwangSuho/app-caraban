import { Response } from "express";
import { validationResult } from "express-validator";
import { RequestWithUser } from "../types/express";
import { Campsite, Review } from "../models";
import { logger } from "../utils/logger";

export async function listReviewsByCampsite(
  req: RequestWithUser,
  res: Response
) {
  const { campsiteId } = req.params;
  const reviews = await Review.findAll({
    where: { campsiteId },
    order: [["createdAt", "DESC"]],
  });
  return res.json({ data: reviews });
}

export async function createReview(req: RequestWithUser, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { campsiteId, rating, comment } = req.body;

  const campsite = await Campsite.findByPk(campsiteId);
  if (!campsite) {
    return res.status(404).json({ message: "Campsite not found" });
  }

  try {
    const review = await Review.create({
      campsiteId,
      userId: req.user!.id,
      rating,
      comment,
    });

    return res.status(201).json({ data: review });
  } catch (err) {
    logger.error("Failed to create review", { err });
    return res.status(400).json({ message: "Failed to create review" });
  }
}
