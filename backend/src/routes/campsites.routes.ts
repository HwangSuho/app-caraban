import { Router } from "express";
import { body } from "express-validator";
import {
  createCampsite,
  deleteCampsite,
  getCampsite,
  listCampsites,
  listMyCampsites,
  updateCampsite,
} from "../controllers/campsite.controller";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const createValidators = [
  body("name").isString().notEmpty().withMessage("name is required"),
  body("pricePerNight")
    .isFloat({ min: 0 })
    .withMessage("pricePerNight must be a non-negative number"),
  body("description").optional().isString(),
  body("location").optional().isString(),
];

const updateValidators = [
  body("name").optional().isString().notEmpty(),
  body("pricePerNight").optional().isFloat({ min: 0 }),
  body("description").optional().isString(),
  body("location").optional().isString(),
];

router.get("/", listCampsites);
router.get("/mine", firebaseAuth, requireAuth, listMyCampsites);
router.get("/:id", getCampsite);
router.post("/", firebaseAuth, requireAuth, createValidators, createCampsite);
router.put("/:id", firebaseAuth, requireAuth, updateValidators, updateCampsite);
router.delete("/:id", firebaseAuth, requireAuth, deleteCampsite);

export default router;
