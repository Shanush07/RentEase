import express from "express";
import cors from "cors";
import "dotenv/config.js";
import prisma from "./prisma.js";
import { clerkMiddleware } from "@clerk/express"; // server-level clerk middleware

import studentRoutes from "./routes/studentRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import guardRoutes from "./routes/guardRoutes.js";

const app = express();

// 1. CORS
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL_USER || "http://localhost:5173",
      process.env.FRONTEND_URL_GUARD || "http://localhost:5174",
    ],
    credentials: true,
  })
);

// 2. Stripe webhook first (raw body)
app.use("/api/payments/webhook", express.raw({ type: "application/json" }), paymentRoutes);

// 3. JSON parser
app.use(express.json());

// 4. Clerk middleware (adds req.auth etc)
app.use(clerkMiddleware());

// 5. Basic root
app.get("/", (req, res) => res.send("🚲 VIT Cycle Rental Backend Running"));

// NOTE: mount at plural /api/students (was /api/student before)
app.use("/api/students", studentRoutes);

// other route mounts
app.use("/api/rental", rentalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/guard", guardRoutes);

// verify route (protected)
import { requireAuth } from "@clerk/express";
app.get("/api/verify", requireAuth(), (req, res) => {
  res.json({
    message: "✅ Clerk authentication working!",
    userId: req.auth.userId,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
