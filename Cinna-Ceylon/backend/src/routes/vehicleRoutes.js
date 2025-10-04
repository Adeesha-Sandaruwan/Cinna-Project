import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  submitMaintenanceReport,
  submitAccidentReport,
  getVehicleMaintenanceHistory,
  getVehicleAccidentHistory
} from "../controllers/vehicleController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		console.log("Multer destination - file:", file);
		cb(null, path.join(__dirname, "../uploads"));
	},
	filename: function (req, file, cb) {
		console.log("Multer filename - file:", file);
		const filename = Date.now() + "-" + file.originalname;
		console.log("Generated filename:", filename);
		cb(null, filename);
	}
});

const upload = multer({ 
	storage,
	fileFilter: (req, file, cb) => {
		console.log("Multer fileFilter - file:", file);
		cb(null, true);
	}
});

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log("Debug - Request content-type:", req.get('content-type'));
  console.log("Debug - Request body:", req.body);
  console.log("Debug - Request files before multer:", req.files);
  console.log("Debug - Request file before multer:", req.file);
  next();
};

router.post(
	"/",
	upload.fields([
		{ name: "insuranceFile", maxCount: 1 },
		{ name: "serviceFile", maxCount: 1 },
		{ name: "maintenanceReport", maxCount: 1 },
		{ name: "accidentReport", maxCount: 1 }
	]),
	createVehicle
);
router.get("/", getVehicles);
router.get("/:id", getVehicleById);
// Simple update without files
router.put("/:id", updateVehicle);

// File upload update route
router.put(
  "/:id/files",
  upload.fields([
    { name: "insuranceFile", maxCount: 1 },
    { name: "serviceFile", maxCount: 1 },
    { name: "maintenanceReport", maxCount: 1 },
    { name: "accidentReport", maxCount: 1 }
  ]),
  updateVehicle
);
router.delete("/:id", deleteVehicle);

// Maintenance and Accident report submission routes
router.put("/:id/maintenance", 
  debugMiddleware,
  upload.single("maintenanceReport"), 
  submitMaintenanceReport
);

router.put("/:id/accident", 
  debugMiddleware,
  upload.single("accidentReport"), 
  submitAccidentReport
);

// Get vehicle maintenance and accident history
router.get("/:id/maintenance-history", getVehicleMaintenanceHistory);
router.get("/:id/accident-history", getVehicleAccidentHistory);

export default router;
