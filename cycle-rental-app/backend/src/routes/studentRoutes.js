import express from "express";
import { requireAuth } from "@clerk/express";

import {
  syncStudent,
  getStudent,
  getAllStudents,
  getStudentById,
} from "../controllers/studentController.js";

const router = express.Router();

// 🧾 Public route (for debug/admin)
router.get("/", getAllStudents);

// 🔐 Clerk-protected routes
router.post("/sync", requireAuth(), syncStudent);
router.get("/me", requireAuth(), getStudent);

// 🧑 Get student by ID or Clerk userId (can be public or protected as you want)
router.get("/:id", getStudentById);

export default router;
