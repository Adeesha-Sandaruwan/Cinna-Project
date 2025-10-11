import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { createLeaveRequest, getLeaveRequests, getLeaveRequest, updateLeaveRequest, deleteLeaveRequest } from "../controllers/LeaveReqController.js";

const router = express.Router();

// Configure uploads directory for leave certifications
const uploadDir = path.resolve("uploads/leave-certifications");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, safe);
  }
});

const fileFilter = (req, file, cb) => {
  const ok = ["image/jpeg", "application/pdf"].includes(file.mimetype);
  if (!ok) return cb(new Error("Only JPG or PDF files are allowed"));
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/", upload.single("certificationFile"), createLeaveRequest);
router.get("/", getLeaveRequests);
router.get("/:id", getLeaveRequest);
router.put("/:id", updateLeaveRequest);
router.delete("/:id", deleteLeaveRequest);

export default router;
