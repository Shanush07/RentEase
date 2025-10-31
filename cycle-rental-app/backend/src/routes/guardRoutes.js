import express from "express";
import { generateGuardQR } from "../controllers/guardController.js";

const router = express.Router();

// Guard generates QR for their station
router.post("/generate-qr", generateGuardQR);

export default router;
