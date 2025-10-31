import prisma from "../prisma.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

/**
 * 🔄 Sync or create a Student record based on Clerk user info.
 * Called right after login from the frontend.
 */
export const syncStudent = async (req, res) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing Clerk userId" });
    }

    // ✅ Fetch user details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

    if (!email) {
      return res.status(400).json({ message: "Email not found on Clerk user" });
    }

    // ✅ Create or update the student record
    const student = await prisma.student.upsert({
      where: { email },
      update: {
        name: fullName || "Unnamed Student",
        college_id: userId, // store Clerk userId
      },
      create: {
        name: fullName || "Unnamed Student",
        email,
        password_hash: "", // handled by Clerk
        college_id: userId,
      },
    });

    res.status(200).json({
      message: "✅ Student synced successfully",
      student,
    });
  } catch (error) {
    console.error("❌ Error syncing student:", error);
    res.status(500).json({ message: "Error syncing student", error: error.message });
  }
};

/**
 * 👤 Get currently logged-in student info (and pending rides)
 */
export const getStudent = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) return res.status(400).json({ message: "Email not found" });

    const student = await prisma.student.findUnique({
      where: { email },
      include: {
        rentalSessions: {
          where: { status: "PENDING" },
          include: { payment: true },
        },
      },
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    const unpaidRides = student.rentalSessions.filter(
      (s) => !s.payment || s.payment.status !== "PAID"
    );

    const blockBooking = unpaidRides.length >= 3;

    res.json({
      ...student,
      unpaidRides: unpaidRides.length,
      canBook: !blockBooking,
      message: blockBooking
        ? "Please clear your dues before booking new rides"
        : "Eligible for new booking",
    });
  } catch (error) {
    console.error("❌ Error fetching student:", error);
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

/**
 * 🧾 Get all students (admin/debug)
 */
export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { rentalSessions: true },
    });
    res.json(students);
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

/**
 * 🧍‍♂️ Get student by ID (supports both student_id and Clerk userId)
 * Used by frontend dashboard after login
 */
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to match both student_id and Clerk's userId (stored as college_id)
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ student_id: id }, { college_id: id }],
      },
      include: {
        rentalSessions: {
          orderBy: { start_time: "desc" },
          take: 5,
          include: {
            startStation: true,
            endStation: true,
            startGuard: true,
            endGuard: true,
            payment: true,
          },
        },
      },
    });

    if (!student) {
      console.warn(`⚠️ Student not found for ID: ${id}`);
      return res.status(404).json({ message: "Student not found" });
    }

    // Compute unpaid rides
    const unpaidRides = student.rentalSessions.filter(
      (s) => !s.payment || s.payment.status !== "PAID"
    );

    res.json({
      ...student,
      unpaidRides: unpaidRides.length,
      canBook: unpaidRides.length < 3,
      message:
        unpaidRides.length >= 3
          ? "Please clear your dues before booking new rides"
          : "Eligible for new booking",
    });
  } catch (error) {
    console.error("❌ getStudentById Error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching student", error: error.message });
  }
};
