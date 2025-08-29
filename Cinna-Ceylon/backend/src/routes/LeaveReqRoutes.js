import express from "express";
import { createLeaveRequest, getLeaveRequests, getLeaveRequest, updateLeaveRequest, deleteLeaveRequest } from "../controllers/LeaveReqController.js";

const router = express.Router();

router.post("/", createLeaveRequest);
router.get("/", getLeaveRequests);
router.get("/:id", getLeaveRequest);
router.put("/:id", updateLeaveRequest);
router.delete("/:id", deleteLeaveRequest);

export default router;
