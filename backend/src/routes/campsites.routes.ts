import { Router } from "express";
import {
  createCampsite,
  deleteCampsite,
  getCampsite,
  listCampsites,
  updateCampsite,
} from "../controllers/campsite.controller";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/", listCampsites);
router.get("/:id", getCampsite);
router.post("/", firebaseAuth, requireAuth, createCampsite);
router.put("/:id", firebaseAuth, requireAuth, updateCampsite);
router.delete("/:id", firebaseAuth, requireAuth, deleteCampsite);

export default router;
