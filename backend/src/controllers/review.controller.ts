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

export async function updateReview(req: RequestWithUser, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const review = await Review.findByPk(id);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }
  if (review.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { rating, comment } = req.body;
  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();

  return res.json({ data: review });
}

export async function deleteReview(req: RequestWithUser, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.params;
  const review = await Review.findByPk(id);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }
  if (review.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  await review.destroy();
  return res.status(204).send();
}
