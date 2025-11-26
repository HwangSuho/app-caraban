import { Response } from "express";
import { validationResult } from "express-validator";
import { RequestWithUser } from "../types/express";
import { Campsite, Reservation } from "../models";
import { logger } from "../utils/logger";

export async function listMyReservations(req: RequestWithUser, res: Response) {
  const reservations = await Reservation.findAll({
    where: { userId: req.user!.id },
    include: [{ model: Campsite, as: "campsite" }],
    order: [["startDate", "DESC"]],
  });

  return res.json({ data: reservations });
}

export async function getReservation(req: RequestWithUser, res: Response) {
  const { id } = req.params;
  const reservation = await Reservation.findByPk(id, {
    include: [{ model: Campsite, as: "campsite" }],
  });

  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  if (
    reservation.userId !== req.user!.id &&
    req.user!.role !== "admin"
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json({ data: reservation });
}

export async function createReservation(req: RequestWithUser, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { campsiteId, startDate, endDate } = req.body;
  const campsite = await Campsite.findByPk(campsiteId);
  if (!campsite) {
    return res.status(404).json({ message: "Campsite not found" });
  }

  try {
    const reservation = await Reservation.create({
      campsiteId,
      startDate,
      endDate,
      userId: req.user!.id,
      status: "confirmed",
    });

    return res.status(201).json({ data: reservation });
  } catch (err) {
    logger.error("Failed to create reservation", { err });
    return res.status(400).json({ message: "Failed to create reservation" });
  }
}

export async function cancelReservation(req: RequestWithUser, res: Response) {
  const { id } = req.params;
  const reservation = await Reservation.findByPk(id);
  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  if (
    reservation.userId !== req.user!.id &&
    req.user!.role !== "admin"
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  reservation.status = "cancelled";
  await reservation.save();

  return res.json({ data: reservation });
}
