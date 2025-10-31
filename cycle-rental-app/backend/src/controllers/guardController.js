import prisma from "../prisma.js";
import crypto from "crypto";

// ✅ Guard generates a QR code for their station
export const generateGuardQR = async (req, res) => {
  try {
    console.log("📥 /api/guard/generate-qr body:", req.body);
    const { guard_id, station_id } = req.body;

    // 1️⃣ Validate inputs
    if (!guard_id || !station_id) {
      return res.status(400).json({
        message: "guard_id and station_id are required",
      });
    }

    // 2️⃣ Check that guard exists and is assigned to the station
    const guard = await prisma.guard.findUnique({ where: { guard_id } });
    if (!guard) return res.status(404).json({ message: "Guard not found" });

    if (guard.station_id !== station_id) {
      return res.status(400).json({ message: "Guard not assigned to this station" });
    }

    // 3️⃣ Verify station exists
    const station = await prisma.station.findUnique({ where: { station_id } });
    if (!station) return res.status(404).json({ message: "Station not found" });

    // 4️⃣ Expire any existing active QR codes for this guard instead of deleting them
    await prisma.qRCode.updateMany({
      where: {
        guard_id,
        station_id,
        expires_at: { gt: new Date() }, // only active ones
      },
      data: {
        expires_at: new Date(), // expire them immediately
      },
    });

    // 5️⃣ Generate new token and expiry
    const token = crypto.randomBytes(8).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // 6️⃣ Save new QR to database
    const qr = await prisma.qRCode.create({
      data: {
        token,
        expires_at: expiresAt,
        guard_id,
        station_id,
      },
    });

    console.log(`🎟️ QR generated for Guard ${guard_id} at Station ${station_id}`);

    // 7️⃣ Send response
    return res.status(200).json({
      success: true,
      message: "QR generated successfully",
      qr: {
        qr_id: qr.qr_id,
        token: qr.token,
        guard_id,
        station_id,
        expires_at: expiresAt,
      },
    });
  } catch (err) {
    console.error("❌ generateGuardQR error:", err);
    return res.status(500).json({
      message: "Error generating QR",
      error: err.message,
    });
  }
};
