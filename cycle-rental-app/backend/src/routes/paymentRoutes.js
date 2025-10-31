import express from "express";
import {
  createCheckoutSession,
  handleStripeWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-checkout", createCheckoutSession);

// Stripe webhook (raw body)
router.post("/webhook", handleStripeWebhook);

export default router;
