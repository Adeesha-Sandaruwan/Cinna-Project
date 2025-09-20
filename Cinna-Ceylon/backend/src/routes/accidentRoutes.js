import express from "express";
import {
  createAccident,
  getAccidents,
  getAccidentById,
  updateAccident,
  deleteAccident
} from "../controllers/accidentController.js";

const router = express.Router();

router.post("/", createAccident);
router.get("/", getAccidents);
router.get("/:id", getAccidentById);
router.put("/:id", updateAccident);
router.delete("/:id", deleteAccident);

export default router;
