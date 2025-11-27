import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Op } from "sequelize";
import { Campsite } from "../models/campsite";
import { RequestWithUser } from "../types/express";
import { logger } from "../utils/logger";

export async function listCampsites(req: Request, res: Response) {
  const q = (req.query.q as string | undefined)?.trim();

  const where: any = {};
  if (q) {
    where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
      { location: { [Op.like]: `%${q}%` } },
    ];
  }

  const campsites = await Campsite.findAll({
    where,
    order: [["id", "DESC"]],
  });
  return res.json({ data: campsites });
}

export async function listMyCampsites(req: RequestWithUser, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const campsites = await Campsite.findAll({
    where: { hostId: req.user.id },
    order: [["id", "DESC"]],
  });
  return res.json({ data: campsites });
}

export async function getCampsite(req: Request, res: Response) {
  const { id } = req.params;
  const campsite = await Campsite.findByPk(id);
  if (!campsite) {
    return res.status(404).json({ message: "Campsite not found" });
  }
  return res.json({ data: campsite });
}

export async function createCampsite(req: RequestWithUser, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, location, pricePerNight } = req.body;
    const campsite = await Campsite.create({
      name,
      description,
      location,
      pricePerNight,
      hostId: req.user.id,
    });

    // Promote to host if user created a campsite
    if (req.user.role === "user") {
      req.user.role = "host";
      await req.user.save();
    }

    return res.status(201).json({ data: campsite });
  } catch (err) {
    logger.error("Failed to create campsite", { err });
    return res.status(400).json({ message: "Failed to create campsite" });
  }
}

export async function updateCampsite(req: RequestWithUser, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const campsite = await Campsite.findByPk(id);
  if (!campsite) {
    return res.status(404).json({ message: "Campsite not found" });
  }

  if (campsite.hostId && campsite.hostId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const { name, description, location, pricePerNight } = req.body;
    campsite.name = name ?? campsite.name;
    campsite.description = description ?? campsite.description;
    campsite.location = location ?? campsite.location;
    campsite.pricePerNight = pricePerNight ?? campsite.pricePerNight;
    await campsite.save();
    return res.json({ data: campsite });
  } catch (err) {
    logger.error("Failed to update campsite", { err });
    return res.status(400).json({ message: "Failed to update campsite" });
  }
}

export async function deleteCampsite(req: RequestWithUser, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.params;
  const campsite = await Campsite.findByPk(id);
  if (!campsite) {
    return res.status(404).json({ message: "Campsite not found" });
  }

  if (campsite.hostId && campsite.hostId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  await campsite.destroy();
  return res.status(204).send();
}
