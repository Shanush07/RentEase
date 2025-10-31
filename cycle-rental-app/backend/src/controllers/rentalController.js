import prisma from "../prisma.js";
import { Decimal } from "@prisma/client/runtime/library.js";

// =====================================================================
// ✅ BOOK RIDE (Simulation Mode)
// =====================================================================

export const bookRide = async (req, res) => {
  try {
    console.log("📩 Incoming body:", req.body);

    // 🧩 Simulation constants (since frontend scan not ready)
    const HARDCODE_GUARD = "34f61b72-b463-4e88-abab-011ca0ecea17";
    const HARDCODE_STATION = "82684c80-c1ac-4253-9fac-514d8049491f";

    // 🔍 Find the latest valid QR code for that guard + station
    const latestQR = await prisma.qRCode.findFirst({
      where: {
        guard_id: HARDCODE_GUARD,
        station_id: HARDCODE_STATION,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: "desc" },
    });

    if (!latestQR) {
      return res
        .status(400)
        .json({ message: "No valid QR found for simulation. Generate one first!" });
    }

    const { student_id } = req.body;
    if (!student_id) {
      return res.status(400).json({ message: "Missing student_id" });
    }

    // 1️⃣ Verify student
    const student = await prisma.student.findUnique({
      where: { student_id },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 2️⃣ Check for active sessions
    const activeRide = await prisma.rentalSession.findFirst({
      where: {
        student_id,
        status: { in: ["PENDING", "ONGOING"] },
      },
    });

    if (activeRide) {
      return res
        .status(400)
        .json({ message: "You already have an active ride in progress!" });
    }

    // 3️⃣ Create new rental session
    const session = await prisma.rentalSession.create({
      data: {
        status: "PENDING",
        student_id,
        start_station_id: HARDCODE_STATION,
        start_guard_id: HARDCODE_GUARD,
        start_qr_id: latestQR.qr_id,
      },
    });

    console.log("✅ Ride booked successfully:", session.session_id);

    return res.status(201).json({
      message: "Ride booked successfully ✅ (simulation mode)",
      session,
    });
  } catch (error) {
    console.error("❌ bookRide Error:", error);
    return res.status(500).json({ message: "Error booking ride", error: error.message });
  }
};

// ---

// =====================================================================
// ✅ START RIDE
// =====================================================================

export const startRide = async (req, res) => {
  try {
    const { session_id, guard_id, sessionId, guardId } = req.body;
    // Handle multiple naming conventions
    const sessionIdFinal = session_id || sessionId;
    const guardIdFinal = guard_id || guardId;

    if (!sessionIdFinal || !guardIdFinal) {
      return res.status(400).json({ message: "session_id and guard_id are required" });
    }

    const session = await prisma.rentalSession.findUnique({
      where: { session_id: sessionIdFinal },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Ride can only be started if status = PENDING" });
    }

    // ✅ Start ride now — sets start_time and status
    const updated = await prisma.rentalSession.update({
      where: { session_id: sessionIdFinal },
      data: {
        start_time: new Date(), // 🕒 sets current time
        status: "ONGOING",
        startGuard: { connect: { guard_id: guardIdFinal } },
      },
    });

    res.json({ message: "Ride started successfully 🚴‍♂️", updated });
  } catch (error) {
    console.error("❌ startRide Error:", error);
    res.status(500).json({ message: "Error starting ride", error: error.message });
  }
};

// ---

// =====================================================================
// ✅ END RIDE
// =====================================================================

export const endRide = async (req, res) => {
  try {
    const {
      session_id,
      end_guard_id,
      end_station_id,
      end_qr_id,
      sessionId,
      endGuardId,
      endStationId,
      endQrId,
    } = req.body;

    // Handle multiple naming conventions
    const sessionIdFinal = session_id || sessionId;
    const endGuardIdFinal = end_guard_id || endGuardId;
    const endStationIdFinal = end_station_id || endStationId;
    const endQrIdFinal = end_qr_id || endQrId;

    if (!sessionIdFinal || !endGuardIdFinal || !endStationIdFinal || !endQrIdFinal) {
      return res.status(400).json({ message: "Missing required fields to end ride" });
    }

    const session = await prisma.rentalSession.findUnique({
      where: { session_id: sessionIdFinal },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "ONGOING") {
      return res
        .status(400)
        .json({ message: "Ride can only be ended if status = ONGOING" });
    }

    // ⏱️ Calculate duration & cost
    const start = new Date(session.start_time);
    const end = new Date();
    // Calculate difference in minutes (rounded up), with a minimum of 1 minute
    const diffMins = Math.max(1, Math.ceil((end - start) / (1000 * 60)));
    const ratePerMin = 2;
    // Use Decimal for precise calculation
    const amount = new Decimal(ratePerMin * diffMins);

    const updated = await prisma.rentalSession.update({
      where: { session_id: sessionIdFinal },
      data: {
        end_time: end,
        endGuard: { connect: { guard_id: endGuardIdFinal } },
        endStation: { connect: { station_id: endStationIdFinal } },
        endQRCode: { connect: { qr_id: endQrIdFinal } },
        billed_amount: amount,
        status: "COMPLETED",
      },
    });

    // Create a pending payment record
    await prisma.payment.create({
      data: {
        session_id: sessionIdFinal,
        amount,
        method: "STRIPE",
        status: "PENDING",
      },
    });

    res.json({ message: "Ride ended successfully 🏁", updated });
  } catch (error) {
    console.error("❌ endRide Error:", error);
    res.status(500).json({ message: "Error ending ride", error: error.message });
  }
};

// ---

// =====================================================================
// ✅ ACTIVE RIDE (for Student)
// =====================================================================

export const getActiveRides = async (req, res) => {
  try {
    const { studentId } = req.params;
    const ride = await prisma.rentalSession.findFirst({
      where: { student_id: studentId, status: { in: ["PENDING", "ONGOING"] } },
      include: { startStation: true, startGuard: true },
      orderBy: { start_time: "desc" },
    });

    if (!ride) {
      return res.status(404).json({ message: "No active ride found" });
    }

    res.json({ ride });
  } catch (error) {
    console.error("❌ getActiveRides Error:", error);
    res.status(500).json({ message: "Error fetching active ride", error: error.message });
  }
};

// ---

// =====================================================================
// ✅ PAST RIDES (for Student dashboard)
// =====================================================================

export const getPastRides = async (req, res) => {
  try {
    const { student_id } = req.params;
    const rides = await prisma.rentalSession.findMany({
      where: { student_id, status: "COMPLETED" },
      include: {
        startStation: true,
        endStation: true,
        startGuard: true,
        endGuard: true,
        Payment: true,
      },
      orderBy: { end_time: "desc" },
    });
    res.json({ success: true, rides });
  } catch (error) {
    console.error("❌ getPastRides Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching rides", error: error.message });
  }
};