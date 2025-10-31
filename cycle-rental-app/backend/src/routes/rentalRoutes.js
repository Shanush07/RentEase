import express from "express";
import {
  bookRide,
  startRide,
  endRide,
  getActiveRides,
  getPastRides,
} from "../controllers/rentalController.js";

const router = express.Router();

router.post("/book", bookRide);
router.patch("/start", startRide);
router.patch("/end", endRide);
router.get("/active/:studentId", getActiveRides);
router.get("/past/:student_id", getPastRides);

export default router;
